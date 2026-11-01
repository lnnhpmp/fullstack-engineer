# SoR automation

## Summary

Automate repair-quote pricing against each client's contractual Schedule of Rates (SoR), replacing PDF-hunting with structured, selectable data (WIG: booked repair backlog). Two axes from `exploration/01-roadmap.md`:

---

## Milestones

### M1 · Price-list schema, seed & pick flow — Lindenhome + Meridian

Scope: **C1 — price lists as structured data in quoting** (greenlit deliverable, Lindenhome + Meridian). C2 (auto-match) and C3 (auto-draft) are follow-ons in this same account milestone; C4/C5 are later milestones (M2–M4).

#### Data model

Six tables plus two columns on `work_order_item`.

**anchor_catalog_item**

```sql
anchor_catalog_item (
  id        uuid PRIMARY KEY
  name      varchar NOT NULL
  aliases   text[]
)
```

**price_list**

```sql
price_list (
  id               uuid PRIMARY KEY
  name             varchar NOT NULL
  country          varchar(2)    -- FR / SG
  currency         varchar(3)    -- EUR / SGD (ISO 4217)
  pattern          varchar(1)    -- 'B'
  confidence_tier  varchar       -- 'contract-read'
  valid_from       date
  valid_to         date NULL
  source           varchar       -- contract ref / file
  version          int
)
```

**account_price_list** — many-to-many

```sql
account_price_list (
  price_list_id   uuid   -- FK → price_list.id
  customer_id     int    -- FK → customer.id
)
```

**price_list_line**

```sql
price_list_line (
  id                      uuid PRIMARY KEY
  price_list_id           uuid NOT NULL          -- FK → price_list.id
  code                    varchar
  designation             text
  section                 varchar
  kind                    enum LINE | LABOUR_RATE | COEFFICIENT | DEDUCTION
  unit_of_measure         varchar
  anchor_catalog_item_id  uuid NULL              -- FK → anchor_catalog_item.id (C2 hook)
  coefficient_target      varchar NULL
  discount_pct            decimal(5,2) NULL
  min_quantity            int NULL
  max_quantity            int NULL
  valid_from              date
  valid_to                date NULL
)
```

**price_list_line_price**

```sql
price_list_line_price (
  id            uuid PRIMARY KEY
  line_id       uuid NOT NULL          -- FK → price_list_line.id
  time_band_id  uuid NULL              -- FK → time_band.id
  unit_price    decimal(12,2) NOT NULL
)
```

**time_band**

```sql
time_band (
  id     uuid PRIMARY KEY
  name   varchar   -- office-hours / after-office-hours / sat-pm-sun-ph / surcharged / normal
)
```

**work_order_item** — two added columns

```sql
work_order_item (
  priceListLineId   uuid NULL   -- FK → price_list_line.id
  source            varchar     -- 'list' / 'typed'
)
```

Key decisions:

- `kind` = LINE | LABOUR_RATE | COEFFICIENT | DEDUCTION — Lindenhome's one CSV mixes four row types.
- Prices child-keyed by nullable `time_band` — Lindenhome parts = 1 price (null band), labour = 2 bands (normal/surcharged); Meridian = every line in 3 bands.
- `account_price_list` many-to-many — Lindenhome is 2 customers, Meridian a parent over 15 siblings (6 identifiable, no parent link).
- `anchor_catalog_item` nullable — C2 hook, populated later.
- Effective dating + version — annual repricing.

#### Release plan (C1 · 2 weeks, 1 engineer)

**R1 · Data + backend (week 1)**

- `price_lists` schema + entities, Lindenhome + Meridian importers, account links.
- GraphQL queries (`priceListForAccount`, `searchPriceListLines`, `priceListLine`) + pick command + `source`/`priceListLineId` columns.
- Invisible to CSMs; verified via GraphQL/psql; seed stays idempotent.

**R2 · Admin search & pick (week 2)**

- "Pick from price list" dialog, per-client formatting, Meridian band pick.
- E2E on the `R26-16849 → Salesforce` tour with a list-priced item.

**Release & measurement**

- Roll out to Lindenhome + Meridian CSMs
- rollout % = picked-from-list lines ÷ eligible lines (traced via the `source` signal recorded on items).


---

## Tickets

### PLA-5 · C1: price_lists schema, entities and seed scaffolding (2 pts)

#### Context

C1 turns each client's SoR into queryable data. This is the foundation: the `price_lists` schema + TypeORM entities that the importers, queries, and pick command build on. Follow the house layout used by `work-orders` (see `backend/src/work-orders/infrastructure/database/`).

#### Tasks

- [ ] Add a `price_lists` Postgres schema + TypeORM entities in `backend/src/price-lists/{domain,commands,queries,infrastructure}` (entities in `infrastructure/database/`).
- [ ] `price_list` — name, country (FR/SG), currency (EUR/SGD), pattern (`B`), confidence_tier (`contract-read`), valid_from/valid_to, source, version.
- [ ] `account_price_list` — many-to-many to `users.customer`.
- [ ] `price_list_line` — code, designation, section, `kind` (LINE | LABOUR_RATE | COEFFICIENT | DEDUCTION), unit_of_measure, nullable `anchor_catalog_item_id`, coefficient_target, discount_pct, min_qty/max_qty, valid_from/valid_to.
- [ ] `price_list_line_price` — child of line: nullable `time_band_id` + unit_price.
- [ ] `time_band` — name (office-hours / after-office-hours / sat-pm-sun-ph / surcharged / normal).
- [ ] `anchor_catalog_item` — nullable hook, populated in C2.
- [ ] Extend `backend/seed/seed.ts` to create + truncate these tables so `pnpm seed` stays idempotent.

#### Acceptance Criteria

- [ ] `pnpm seed` runs clean and creates `price_lists.*`.
- [ ] `pnpm typecheck` and `pnpm test` pass.

---

### PLA-6 · C1: Lindenhome importer + account link (1 pt)

#### Context

Lindenhome's list is `exploration/price-lists/lindenhome-price-list.csv` (France, EUR). One CSV mixes row types (labour rates, coefficients, discounts, ordinary lines), so the importer must classify by `section`. Build two small explicit importers, not a generic engine (shaping "Rabbit holes").

#### Tasks

- [ ] Parse the CSV with a small, explicit importer.
- [ ] Map rows to `kind` from `section`: HOURLY RATE → LABOUR_RATE, COEFFICIENT → COEFFICIENT, DEDUCTIONS → DEDUCTION, else LINE.
- [ ] Labour has two bands: `0001AS` normal (103.72) + `0002AS` surcharged (108.97) → two `price_list_line_price` rows with time bands; parts → single price with null band.
- [ ] Coefficients (0097AS 1.41 off-list part, 5050AS/5510AS 1.31 subcontractor) and volume discounts (5600AS 6%, 5610AS 8%) stored as their `kind` — displayed, not applied.
- [ ] Link the list to Lindenhome **AL** via `account_price_list` (two Lindenhome customers exist; this list is AL's).
- [ ] List metadata: country FR, currency EUR, pattern `B`, confidence_tier `contract-read`.

#### Acceptance Criteria

- [ ] `pnpm seed` loads Lindenhome lines.
- [ ] `psql` shows the list + AL link.
- [ ] Row/band counts match the CSV.

---

### PLA-7 · C1: Meridian importer + account links (1 pt)

#### Context

Meridian's list is `exploration/price-lists/meridian-sor-table-a.csv` (Singapore, SGD, 81 lines). Unlike Lindenhome it has no `section` and prices every line in three time bands.

#### Tasks

- [ ] Parse the CSV with a small, explicit importer.
- [ ] Each line → three `price_list_line_price` rows: office-hours / after-office-hours / sat-pm-sun-ph.
- [ ] Items 67–73 (statutory load tests/endorsements) print one rate across bands — handle explicitly.
- [ ] Store the "Star Rates 10%" clause as a note (no Table A row is marked Star Rate — don't build a mechanism for an empty set).
- [ ] Link the list to the 6 identifiable sibling accounts (4 "Meridian" + Serava Mall + MR Retail Trustee) via `account_price_list`. The 9 unidentified siblings are a no-go (one INSERT each later).
- [ ] List metadata: country SG, currency SGD, pattern `B`, confidence_tier `contract-read`, valid for the 5-year term.

#### Acceptance Criteria

- [ ] `pnpm seed` loads 81 lines × 3 bands.
- [ ] 6 account links present.
- [ ] Counts match the CSV.

---

### PLA-8 · C1: price list GraphQL queries (2 pts)

#### Context

Price lists are reference data (loaded/versioned), not event-sourced like `WorkOrder`. The admin pick dialog (PLA-10) needs these read-only queries to search and display the account's list.

#### Tasks

- [ ] `priceListForAccount(customerId)` → list + lines + prices.
- [ ] `searchPriceListLines(priceListId, query)` → match code / designation / name.
- [ ] `priceListLine(id)`.
- [ ] Add types to `backend/src/schema.graphql` and resolvers in `price-lists/infrastructure/graphql.ts`; wire into the app's resolver registration (see `work-orders/infrastructure/graphql.ts`).

#### Acceptance Criteria

- [ ] Queries run at `/graphql`.
- [ ] Search matches by code and designation substring.

---

### PLA-9 · C1: pick-from-list command + item source column (2 pts)

#### Context

The write path that turns "pick a line" into a priced item, and it carries the adoption signal: `source` + `priceListLineId` on the item. The rollout-% metric (roadmap §5) counts a line only if its final sent price traces to an unedited pick — so provenance must track the *current* price, not just the initial pick.

#### Tasks

- [ ] `pickPriceListLine({ workOrderId, itemId, priceListLineId, timeBandId? })` in `backend/src/price-lists/commands/`.
- [ ] Reuse the existing `ItemSellPriceSetEvent` (see `work-orders/domain/events.ts` + `WorkOrder.updateItem`): set `sellPrice` to the line's unit price for the chosen band.
- [ ] Record `priceListLineId` + `source: 'list'` on the item: one nullable `priceListLineId` column on `work_order_item` (orm entity `work-order-item.orm-entity.ts`) and a `source` field on `ItemProps`/domain.
- [ ] A later manual `updateItem` that changes `sellPrice` clears the list provenance — set `source` to `'typed'` (or null) and `priceListLineId` to null, so an overridden price never counts as on-list.
- [ ] Deleting the item removes it; a re-added item starts with no provenance.
- [ ] No change to the Salesforce seam — `createQuote` already carries `price`.

#### Acceptance Criteria

- [ ] Picking a line sets `sellPrice` + records `priceListLineId` + `source: 'list'`.
- [ ] A subsequent manual `sellPrice` edit resets `source` to `'typed'` and clears `priceListLineId`.
- [ ] Aggregate rehydration preserves provenance.
- [ ] Unit tests in `*.spec.ts` cover pick → override → delete/re-add.

---

### PLA-10 · C1: admin "Pick from price list" dialog (4 pts)

#### Context

The CSM-facing surface. Today pricing is free-hand ("Edit price"); this adds a search-and-pick flow beside it. It consumes PLA-8's search query and PLA-9's pick command. A throwaway prototype with fake data already exists (`PriceListPickerDialog.svelte`, `priceListMock.ts`) — wire it to the real GraphQL.

#### Tasks

- [ ] In the work-order detail page (`admin/src/routes/work-orders/details/[id]/+page.svelte`), next to "Edit price" (`PriceDialog.svelte`), add a "Pick from price list" action on items — only when the account has a list.
- [ ] Type-ahead search over `searchPriceListLines`; selecting a line calls the pick command, fills the sell price, marks the item on-list.
- [ ] Filter by item type: `MAN_HOUR` → `LABOUR_RATE` lines; parts → `LINE` lines.
- [ ] Reuse patterns: `ItemRow.svelte`, `ItemsCard.svelte`, `PriceDialog.svelte`, `api.ts`/`mutate.ts`.
- [ ] FE analytics events (UX funnel) — complements the backend `source` signal (PLA-9); product analytics, not the adoption metric: `picker.opened`, `picker.searched` (debounced), `picker.no_match`, `picker.line_picked` (with priceListLineId, timeBandId), `picker.edited_after_pick`, `picker.abandoned`.

#### Acceptance Criteria

- [ ] CSM searches by name, picks a line, price lands on the item, on-list mark visible.
- [ ] Respects `editable` state.
- [ ] Picker emits the events above (including a `no_match` case) for tuning search/UI.

---

### PLA-11 · C1: per-client formatting + Meridian band pick (3 pts)

#### Context

The two lists render differently: Lindenhome is one all-in price per line; Meridian prices every line in three bands. Auto-deriving the band from "when the work happens" is C3 (out of scope).

#### Tasks

- [ ] Lindenhome: show one all-in price per line (header clause: price includes labour/supply/disposal).
- [ ] Meridian: show the three band prices (office / after-office / Sat-pm–Sun–PH) and let the CSM pick the band.
- [ ] Show the list's currency code (EUR / SGD).

#### Acceptance Criteria

- [ ] Lindenhome shows a single price.
- [ ] Meridian shows band selection and the correct price lands on the item.

---

### PLA-12 · C1: end-to-end + edge cases (5 pts)

#### Context

Integration pass + buffer. Confirms the picked price flows through to Salesforce unchanged and the edge cases are handled.

#### Tasks

- [ ] Walk the `R26-16849 → Salesforce` tour (README "A tour") with a list-priced item; confirm the picked price flows into the Salesforce quote unchanged (no Salesforce seam change).
- [ ] Edge cases: no search match (graceful), cross-currency (don't auto-convert — store/show ISO only), unlinked account (hide picker), already-sent quote (picker respects `editable`), `pnpm seed` idempotency.
- [ ] Buffer for integration fixes.

#### Acceptance Criteria

- [ ] Tour works end-to-end with a list-priced item.
- [ ] Edge cases handled without error.
- [ ] `pnpm seed && pnpm dev` clean.
