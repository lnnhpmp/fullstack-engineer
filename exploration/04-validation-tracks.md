# Validation tracks A and B

Two empirical checks run against real work orders and real quotes before the roadmap was written.

## Track A: can we recognise a repair as a price-list line? (trigger feasibility)

**Question.** The automation starts when a work order is created: a technician or ops engineer adds work-order items (`PART` linked to a catalogue part, `MAN_HOUR`, `EXTERNAL_PART`, `INSTALLATION`, `TECH_SUPPORT`). From the parts and labour on a real work order, how often can we recognise the repair and map it to a priced line on the client's list, that is, how often is there something to trigger on?

**Unit of analysis: the work order (the job), not the item.** Several items (a belt, a roller, some man-hours) often roll up into one bundled price-list outcome, e.g. *"Replace the overspeed governor, including rope, pulley and contact"*. Match signals: item product name, SKU and family against the price-list wording, plus the quote grand total against the list price × quantity as a coarse price check (there is no per-line price on the work-order side; that is Track B).

This measures *feasibility and coverage*, not adoption: what share of real repair activity is even expressible as SoR outcomes at the trigger point, and how the work-order item vocabulary diverges from the price-list wording.

**Result.** Across the four accounts run, **47%** of work orders are confidently trigger-mappable:

| Account | Trigger-mappable |
| -- | -- |
| Lindenhome | 69% |
| Public Immo/PIM | ~40% |
| RVF | ~6% (rate-card / time-and-materials work) |
| Valmont | inherently low (OEM procurement) |

**Two findings that shaped the mechanism:**

1. Matching should use a **table that maps our parts (or SKUs) to price-list lines, learned from real quote history** (Track B), not fuzzy name matching.
2. Coverage is **account-shaped**: the split between mappable and bespoke work is each account's automation ceiling.

The same run also gave three data-model requirements: name aliasing, roll-up of several items into one line, and an explicit out-of-scope state.

## Track B: is the price list used to price quotes today? (adoption and conformance)

**Question.** Even if we can map an item to a price-list line, if CSMs routinely override that price then the SoR is not really in use and automating it delivers little. So: line by line, are quoted prices sitting at the list price, and is that price *kept*? This is the empirical counterpart to the adoption metric.

**Unit of analysis: the Salesforce quote line item** (unit price, quantity, free-text description, catalogue product code). Each line is matched to a price-list line on price and wording and put in one of four buckets:

* **exact_list** — quoted at the list rate (adoption).
* **name_only** — the list has the item, but it was re-priced (the adoption gap).
* **explicit_off_list** — ops flagged it as outside the list (e.g. Lindenhome product code `0097AS`, the coefficient for a part not on the list, or "not on the list" typed in the description): a defined mark-up mechanism, not a failure.
* **no_match** — plain labour or bespoke work with no corresponding price-list line.

**Result.** Exact-list adoption across the seven accounts:

| Account | exact_list | name_only (re-priced) |
| -- | -- | -- |
| Lindenhome | **81%** | |
| Meridian | 47% | |
| Public Immo/PIM | 41% | 31% |
| RVF | 23% | 13% |
| Foyer Francilien Habitat | 15% | 20% |
| TLR | 3% | 23% |
| Valmont | 3% | |

**Three value modes per account:**

* **Automate-now** — Lindenhome, Meridian. The SoR is already the live price; automation speeds up what people do.
* **Enforce-the-rate** — Foyer Francilien Habitat. A large re-pricing gap: structuring the list is a margin win.
* **Deprioritise** — TLR, Valmont. Little real use.

RVF is a reference framework plus coefficient, not a kept price list.

PIM's re-priced share is its off-list mark-up engine: PIM is dual-mechanism (02-taxonomy).
