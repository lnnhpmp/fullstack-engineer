# WeMaintain interview — shaping presentation + CTO discussion

60 minutes: ~30 min you present the shaping, ~30 min discussion with the CTO.

Grading (from README "About the meeting"): **how deep you went**, **what you looked for**, **whether the data model holds**, and **how you work with a non-technical stakeholder**.

---

## The 30-min arc (time budget)

| Min | Section | Purpose |
|---|---|---|
| 0–2 | Problem | The PDF-hunt pain; WIG lever = speed + rate enforcement |
| 2–3 | Appetite & scope | C1 only · 2 weeks · 1 engineer · Pattern B only |
| 3–13 | Solution | *Where it lives* → *data model* → *the flow* (the heart) |
| 13–18 | Key decisions & rabbit holes | Your judgment calls, each traced to the data |
| 18–21 | No-gos / what I left out | C2–C5, Pattern A, PM, 9 siblings, dashboards, currency/tz |
| 21–24 | Milestones + release plan | 2-week plan, R1 + R2 |
| 24–26 | Success measure | rollout %, line-item grain, "result not method" |
| 26–28 | Open questions for the PM | 3 shaping questions + timezone/currency flag |

Rule for the whole talk: lead every decision with **evidence → choice → trade-off**. Don't dump features; tell a decision story.

---

## Slides (with speaker notes)

### Slide 1 · Title / one-liner

**"SoR price lists as structured data in quoting — Lindenhome + Meridian."**

- Say: the greenlit deliverable = **C1**. 2 weeks, 1 engineer.
- One WIG sentence: *turn an agreed price into selectable data so CSMs stop transcribing and start confirming.*

### Slide 2 · Problem

- The pain: the list is buried in a contract PDF; the CSM re-types every price, remembering *whether* an SoR even exists.
- Evidence: **81%** (Lindenhome) / **47%** (Meridian) of quoted lines already sit exactly on the list — so the price is decided, we only lose time and risk typos.
- **Cite:** `exploration/04-validation-tracks.md` (Track B), `03-salesforce-audit.md`.
- Depth signal: say "the win is *not* that prices become correct — they mostly already are — it's that the CSM stops typing and starts confirming."

### Slide 3 · Appetite & scope

- 2 weeks / 1 engineer. **C1 only.** No design pass (per the pitch).
- Say: C2/C3 are follow-ons in the same account milestone; C4/C5 are later milestones.
- Plant the boundary early so the CTO can't accuse you of scope creep.

### Slide 4 · Where it lives

- New `price_lists` schema in the **backend**, exposed through GraphQL — **not** a Salesforce object.
- **Why:**
  1. Audit 03: Salesforce has **no SoR concept**; pricebooks are per-country, never per-client.
  2. The CSM prices inside the **admin**, which hits our GraphQL, not Salesforce.
  3. Pricing rules are engineering logic we already own.
- Keep sending only the **resulting price** (`createQuote` already carries `price`); keep the **source** of the price on our side.

### Slide 5 · Data model (the diagram)

Six tables:

```
anchor_catalog_item            price_list                      account_price_list
-------------------            ----------                      ------------------
id                            id (uuid)                        price_list_id  ┐ (many:many)
name                          name                             customer_id    ┘
aliases[]                     country (FR/SG)
                              currency (EUR/SGD)               price_list_line
                              pattern ('B')                    --------------------
                              confidence_tier ('contract-read') id
                              valid_from / valid_to            price_list_id
                              source (contract ref, file)      code / designation
                              version                          section / kind
                                                               unit_of_measure
price_list_line_price          time_band                        anchor_catalog_item_id (nullable)
----------------------         ---------                        coefficient_target
line_id                       id                                discount_pct / min_quantity / max_quantity
time_band_id (nullable)       name (office-hours /             valid_from / valid_to
unit_price                     after-office-hours /
                              sat-pm-sun-ph / surcharged / …)
```

- Plus `work_order_item.source` + `work_order_item.priceListLineId` (the adoption trace).

### Slide 6 · Five data-model decisions (each traced to the CSVs)

1. **`kind`** = LINE / LABOUR_RATE / COEFFICIENT / DEDUCTION — Lindenhome's single CSV mixes hourly labour rates, service rates (per day/week/trip), coefficient rules and volume discounts alongside ordinary part lines; the schema must not treat every row as a price. `section` stays the raw CSV text, `unit_of_measure` a free string ("per day", "per level", "coefficient (e.g. 1.07)"), not an enum.
2. **Prices child-keyed by nullable `time_band`** — Meridian prices every line in 3 bands; Lindenhome has one all-in price. A normalised `line → price` child with a nullable band holds both.
3. **Many-to-many `account_price_list`** — "one account = one list" is false: Lindenhome is *two* customers (list belongs to AL), Meridian is a parent over 15 siblings with no link in the data.
4. **Nullable `anchor_catalog_item`** — C2's hook; lay the FK now so C2 doesn't force a migration.
5. **Effective dating + version** on list and line — annual repricing (normal for French lists) must not corrupt history.

### Slide 7 · The flow

1. **Seed** — two explicit importers (Lindenhome + Meridian, different shapes), account links, idempotent.
2. **Backend** — `priceListForAccount`, `searchPriceListLines`, `priceListLine`; `pickPriceListLine` command.
3. **Admin** — "Pick from price list" dialog beside today's "Edit price"; type-ahead, fills sell price, marks on-list.

- **Depth signal:** the pick reuses the existing `ItemSellPriceSetEvent` for the price and changes nothing on the Salesforce seam — but `source` + `priceListLineId` are new item state, so the pick event payload grows (extend `ItemSellPriceSetEvent`, or a dedicated `ItemPricedFromListEvent`); a freehand re-edit clears provenance.

### Slide 8 · Rabbit holes I avoided

- Two small explicit importers — **not** a generic import engine (the two files disagree on shape).
- No Salesforce objects for price lists (see "where it lives").
- Don't populate the anchor catalog now — it's C2.
- Star Rates 10% → stored as a note (no Table A row is actually marked; don't build for an empty set).
- Coefficients/discounts → stored + displayed, **not applied** (needs supplier-invoice + order-quantity context = C4).

### Slide 9 · No-gos (what I left out)

- **C2** auto-match, **C3** auto-draft, **C4** enforce + mark-up, **C5** compliance/sending.
- **Pattern A** clients and their mark-up engine.
- **Lindenhome PM** (only AL's list is in the folder).
- The **9 unidentified Meridian siblings** (linked later, one INSERT each).
- **Rollout-% dashboards** (we record the signal; reporting is later).
- **Multi-currency math** and **timezone** (store the code; defer the math to C3).

### Slide 10 · Milestones + release plan

Two weeks: schema+seed → backend queries/pick → admin dialog → per-client formatting → e2e.

- **R1 · Data + backend (end of week 1)** — schema, importers, links, queries, pick command + `source` column. Invisible, verified via GraphQL/psql.
- **R2 · Admin search & pick (end of week 2 — go-live)** — dialog, formatting, Meridian band pick, e2e on `R26-16849`.

### Slide 11 · Success measure

- **Rollout %** = picked-from-list lines ÷ eligible lines, **line-item grain**, *result not method*.
- A line counts only if its **final sent price traces to an unedited pick** — excludes CSM-overridden suggestions.
- Baseline 81%/47% already *sit on* the list, but rollout % **starts at ~0** and climbs — the win is "stopped typing," not "prices became correct."

### Slide 12 · Open questions for the PM

1. Does Lindenhome AL's list also apply to Lindenhome PM, or wait for PM's contract?
2. Is name-search enough for Meridian (81 lines), or do CSMs think in part codes first?
3. Confirm the CSM picks the time band manually in C1 (auto-derive is C3)?

- Plus: timezone/currency are stored-not-computed until C3.
- **Close by asking one back** (e.g., reconcile Lindenhome AL vs PM before or after C1?).

---

## CTO discussion — polished answers

### Q1 — "Why backend and not a Salesforce object?"

The audit (03) shows Salesforce has no SoR concept and pricebooks are per-country, never per-client. Retrofitting per-client lists would fork the toy Salesforce, add Apex, and put pricing rules in the wrong system — the CSM prices in the admin, which hits our GraphQL. So the list is a `price_lists` schema in our backend; we keep sending only the resulting price, exactly as `createQuote` already does.

### Q2 — "Walk me through why the data model looks like this."

I traced every field to the two CSVs. `kind` because Lindenhome's single CSV mixes labour rates, service rates, coefficients, and discounts with ordinary lines — and `unit_of_measure` stays a free string because it must hold "per day", "per level", "per set", and "coefficient (e.g. 1.07)". Prices as a child keyed by nullable `time_band` because Meridian prices every line in three bands while Lindenhome has one. Many-to-many `account_price_list` because one-account-one-list is false — Lindenhome is two customers and Meridian is a parent over 15 siblings with no link in the data. And `anchor_catalog_item` is nullable now so C2's matcher doesn't force a migration.

### Q3 — "How do you actually know it's working?"

Rollout %, at line-item grain, defined by *result*: a line counts only if its final sent price traces to an unedited pick. Not clicks, not "the number happens to match" — that's why we record `source` + `priceListLineId` on the item, and why a manual re-edit flips `source` back to `typed`. The FE picker emits a separate funnel (`opened/searched/no_match/picked`) for UX tuning, but the north-star is backend-derived.

### Q4 — "The roadmap's Milestone 1 is C1+C2+C3. Why are you only shaping C1?"

Leadership greenlit C1 specifically, and the shape's no-gos set C2/C3 aside deliberately. C2's matcher needs training data that only exists *after* C1's manual picks ship — there's a hard dependency: the list has to be usable by hand before the matcher can learn. So I scoped C1 tightly but left the hooks (`anchor_catalog_item`, `kind`) so C2/C3 extend rather than migrate.

### Q5 — "Pattern A is our biggest account (Hollins Vale ~€589k). Ignoring it?"

Deferred, not ignored. Pattern A has no table to look up — the price is computed from labour × hours and materials × mark-up, needs supplier-invoice context, and Hollins Vale is mid-dispute. It's C4/Milestone 3. But `kind` and `coefficient_target` already model "a rate you compute with" vs "a price you look up," so Pattern A lands without a schema rewrite.

### Q6 — "What did you get wrong or would you change?"

Meridian's band-pick UX is my biggest uncertainty — I assumed the CSM picks the band manually, but if they think in part-codes first, name-search isn't enough. That's exactly why I put a `no_match` funnel event in, and it's my first PM question.

### Q7 — "You said the pick reuses `ItemSellPriceSetEvent`. But `priceListLineId` and `source` are new state — how do they reach the event-sourced item?"

The existing event only carries `{itemId, sellPrice}`, so provenance can't be a pure reuse. I either extend `ItemSellPriceSetEvent` with optional `priceListLineId`/`source`, or add a dedicated `ItemPricedFromListEvent` raised by the new `pickPriceListLine` command. The command loads the work order, raises the event (sets `sellPrice` to the line's unit price and records provenance), and saves; a later freehand `updateItem` clears provenance. What stays unchanged is the Salesforce seam — we still send only the resulting price.

---

## Pre-meeting checklist

- [ ] Re-run the tour (`R26-16849` → Salesforce) so you can demo if asked.
- [ ] Have the 6-table schema drawn and ready to whiteboard.
- [ ] Memorise the 5 data-model decisions + their CSV evidence.
- [ ] Memorise the 3 PM questions + the timezone/currency flag.
- [ ] Prepare your "one question back" for the CTO.
- [ ] Re-read `exploration/04-validation-tracks.md` (the 81%/47% numbers come from there).
