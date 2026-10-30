# Shape: Price lists as structured data in quoting (Lindenhome + Meridian)

## Problem

Clients with a Schedule of Rates (SoR) have a contractual price list for repairs,
but that list lives in a contract PDF. When a CSM prices a repair quote, they
hunt for the PDF, find the right line, and re-type the price by hand — whether
or not the account actually has an SoR. For Lindenhome and Meridian the agreed
price is already what people type (81% / 47% of quoted lines sit exactly on the
list, Track B), so the work is pure friction: the price is decided, we just lose
time looking it up and risk typos.

The WIG lever here is **speed + rate enforcement**: turn an agreed, already-used
price into data we can select, so a CSM stops transcribing and starts confirming.

## Appetite

Two weeks, one engineer. No design pass beyond what's in this pitch.

## Solution

Get each client's SoR into the backend as real, queryable data, and give the CSM
a "search the client's list, pick the line, price the item" flow in the admin.
This is Project **C1 only**: the foundation that ends PDF-hunting. C2 (auto-match),
C3 (auto-draft), C4, C5 are explicitly out (see No-gos).

### Where it lives

New `price_lists` schema in our Postgres, exposed through GraphQL — **not** a new
Salesforce object. Reasons: the pricing rules are engineering logic we already own
in the backend; the CSM prices inside the admin (which talks to our GraphQL, not
Salesforce); and the audit (03) shows Salesforce has no SoR concept and its
pricebooks are per-country, never per-client. We keep sending the *resulting price*
to Salesforce exactly as today (`createQuote` already carries `price`); we only
add the *source* of the price on our side. A reference to the picked line travels
with the item so the later "rollout %" metric (roadmap §5) can trace it.

### Data model shape

Decided at the product-shape level (roadmap §6): **separate per-contract price
lists, unified by a per-account link, each line pointing at a shared anchor
catalog. Not a shared base list with per-contract overrides.**

```
anchor_catalog_item            price_list                      account_price_list
-------------------            ----------                      ------------------
id                            id (uuid)                        price_list_id  ┐ (many:many)
name                          name                             customer_id    ┘
aliases[]                     country (FR/SG)
                              currency (EUR/SGD)
                              pattern ('B')                    price_list_line
                              confidence_tier ('contract-read')--------------------
                              valid_from / valid_to            id
                              source (contract ref, file)      price_list_id
                              version                          code (0009AS, "1")
                                                               designation
                                                               section (CAR / HOURLY RATE /
                                                                        COEFFICIENT / DEDUCTIONS)
                                                               kind (LINE | LABOUR_RATE |
                                                                     COEFFICIENT | DEDUCTION)
                                                               unit_of_measure (each/h/%/per set)
                                                               anchor_catalog_item_id (nullable)
                                                               coefficient_target (off-list part /
                                                                                   subcontractor / …)
                                                               discount_pct / min_qty / max_qty
                                                               valid_from / valid_to

price_list_line_price          time_band
----------------------         ---------
line_id                       id
time_band_id (nullable)       name (office-hours / after-office-hours /
unit_price                          sat-pm-sun-ph / surcharged / …)
```

Key decisions, each tracing back to the two real CSVs:

- **`kind` distinguishes row types.** Lindenhome's single CSV mixes hourly labour
  rates (`0001AS`/`0002AS`), coefficient rules (`0097AS` 1.41, `5050AS`/`5510AS`
  1.31) and volume-discount rows (`5600AS`/`5610AS`) alongside ordinary lines. The
  schema must not treat all rows as prices.
- **Prices are a child table keyed by time band**, with `time_band_id` nullable.
  Lindenhome labour has two bands (103.72 normal / 108.97 surcharged) and its
  parts one price (null band); Meridian prices *every* line in three bands
  (office / after-office / Sat-pm–Sun–PH), and its statutory rows 67–73 print one
  rate across bands. A normalised `line → price` child with a nullable band holds
  all of these without special-casing.
- **Account linkage is many-to-many.** The list is not "one account = one list":
  Lindenhome is *two* customers in the data (`Lindenhome PM` and `Lindenhome AL`)
  and this list belongs to **AL**; Meridian is a parent over 15 siblings with **no
  parent link in the data**, of which 6 are identifiable here (4 "Meridian" +
  Serava Mall + MR Retail Trustee). One Meridian list → many sibling accounts.
- **`anchor_catalog_item` is a nullable hook now, populated in C2.** C1 is manual
  name-search, so the parts→lines mapping table (the learned lookup) is C2's job;
  we lay the foreign key so C2 doesn't force a migration.
- **Effective dating + version** on both the list and the line, so an annual
  repricing (normal for French lists, 02-taxonomy) doesn't corrupt history.
- **Confidence tier** travels with the list (contract-read for both today).

### The flow

1. **Seed** — extend `seed.ts` to parse the two CSVs (different shapes) into
   `price_lists`, create `account_price_list` links for Lindenhome AL and the six
   identifiable Meridian siblings. Seed stays idempotent.
2. **Backend module** `price-lists/`, following the house layout
   (`domain/ commands/ queries/ infrastructure/`). Price lists are reference data:
   loaded/versioned, not event-sourced like `WorkOrder`. GraphQL adds:
   - `priceListForAccount(customerId)` → the list + lines,
   - `searchPriceListLines(priceListId, query)` → name/designation/code match,
   - `priceListLine(id)`.
   Picking a line is a new command that reuses the existing `ItemSellPriceSetEvent`:
   it sets the item's `sellPrice` to the line's unit price and records
   `priceListLineId` + `source: 'list'` on the item (one extra column on
   `work_order_item`). No change to the Salesforce seam.
3. **Admin UI** — in the work-order detail page, next to today's "Edit price"
   dialog, a "Pick from price list" dialog: type-ahead search over the account's
   list; selecting a line fills the sell price and marks the line as on-list.
   **Per-client formatting**: Lindenhome shows one all-in price per line (its
   header clause says prices include labour/supply/disposal); Meridian shows the
   three band prices and the CSM picks the band (auto-deriving the band from "when
   the work happens" is C3, not here).

## Rabbit holes

- **Parsing the CSVs.** The two files disagree on shape (Lindenhome: sections +
  kinds + coefficients; Meridian: three price columns, no section). Fight the
  urge to build a generic import engine — write two small, explicit importers and
  test them against the files.
- **Salesforce objects for price lists.** Tempting (quotes live there), but it
  forks the toy Salesforce, adds Apex, and puts the pricing rules in the wrong
  system. Rejected; see "Where it lives".
- **The anchor catalog.** Don't try to populate or de-duplicate concepts now; it's
  a C2 concern. Keep the column nullable and move on.
- **Meridian's "Star Rates" 10%.** No row in Table A is actually marked as a Star
  Rate item, so there is nothing to apply. Store the clause as a note; don't build
  a mechanism for an empty set.
- **Auto-applying coefficients/discounts.** Lindenhome's 1.41/1.31 coefficients
  and volume discounts need supplier-invoice context and order quantities that
  don't exist at pick time. Store + display them; applying them is C4.

## No-gos

- **C2** automatic matching (and its learned parts→lines table), **C3** auto-draft,
  **C4** enforce-the-rate and cost-plus, **C5** compliance/sending.
- **Pattern A** (fixed mark-up) clients and their mark-up engine.
- **Lindenhome PM** — its older contract's list isn't in the folder; only AL's is.
- **The 9 unidentified Meridian siblings** — we link the 6 in the data; the rest
  get linked when identified (one INSERT each).
- **Rollout-% reporting dashboards** — we record the per-line source signal now;
  the metric/reporting is a later milestone.
- **Multi-currency math** beyond storing the ISO code (EUR vs SGD) and showing it.

## Milestones (2 weeks, 1 engineer)

1. **Schema + seed (2 days).** `price_lists` tables, entities, two importers,
   account links. `pnpm seed` loads both lists.
2. **Backend queries + pick command (2 days).** `priceListForAccount`,
   `searchPriceListLines`, the pick command + `source` column, unit tests.
3. **Admin search & pick (2 days).** The dialog, wire into sell price, on-list mark.
4. **Per-client formatting + band pick (1.5 days).** Lindenhome single price,
   Meridian band selection.
5. **End-to-end + buffer (2.5 days).** Walk the `R26-16849 → Salesforce` tour with
   a list-priced item; edge cases (no match, cross-currency, unlinked account).

## Success measure

For the two accounts: **share of quote lines priced by picking from the list
versus typed freehand**, at line-item grain (the raw signal behind roadmap §5's
"rollout %"). Revenue is supporting context. Baseline: 81% (Lindenhome) and 47%
(Meridian) already sit on the list price; the win is that the CSM no longer types
them.

## Questions I'd raise with the PM

- Should the Lindenhome AL list also apply to Lindenhome PM, or do we wait for
  PM's current contract? (Exploration says the list is AL's; PM's older quotes
  priced at 73.35 labour.)
- Is "search by name" enough for Meridian (81 lines), or do CSMs think in part
  references/codes first?
- For Meridian, confirm the CSM picks the time band manually in C1 (I'm assuming
  yes, since band-derivation is C3).
