# SoR automation: roadmap and investment case

# 1. The ask, in one paragraph

We want to automate the pricing of repair quotes against each client's contractual **Schedule of Rates**, replacing today's manual process of hunting for PDFs and pricing every line by hand. SoR-governed repairs are a large share of booked repair revenue (§2), so this sits on the WIG of growing booked repair backlog. The build progresses along two interlocking axes: a *capability* axis (functional building blocks that each ship standalone value, §3) and an *account rollout* axis (which clients ride on those capabilities, §4). The first capability lands an early, standalone win (a structured SoR replaces PDF-hunting); Milestone 1 proves it on Lindenhome and Meridian, Milestone 2 adds a second easy client, and later milestones widen the capability set to unlock harder account types. What remains is building it, not more discovery.

Scope is global from day one, across every country we operate in, and contract-specific pricing is treated as core to what a Schedule of Rates *is*, not a later add-on.

# 2. Why this, why now (the investment case)

## The WIG mechanism: how automation moves booked repair backlog

The booked-repair-backlog WIG grows when more repair opportunities convert to booked quotes, faster, without leaking margin. SoR automation works on all three levers:

* **Speed / throughput.** Today a CSM hand-assembles each quote by finding the contract's price list (often a PDF), matching each repair line to it, and pricing it manually. Auto-assembling a complete priced draft removes that manual assembly (the workload CSMs describe in the field notes, 05).
* **Conversion.** Baseline is 53% won/sent and 93% once a decision is made: the loss is largely in quotes that are slow or never sent. Faster, complete drafts push more opportunities to a decision.
* **Margin capture (rate enforcement).** For several accounts the contracted rate is already agreed but CSMs re-price lines by hand. Selecting from a structured SoR *enforces the contracted rate by construction*, a margin win independent of any speed gain.

*Evidence (baseline):* conversion and volume can be baselined cleanly from today's quote data; time-to-quote is directionally usable, though about one quote in twelve has no sent date, so each pre-launch baseline pull has to check how many are missing; SoR coverage % has no underlying field and cannot be baselined from existing data.

## The prize

SoR-governed repairs bring in €3.1M, about 38% of booked repair revenue. Fixed price lists (Pattern B) are the larger part of that and structurally the simpler one, so the roadmap starts there and reaches fixed mark-up accounts (Pattern A) once the core capabilities exist.

## Why it's a high-confidence bet

This is not a speculative NLP project: two empirical validations closed before this plan (04-validation-tracks).

* **Track A**: a large share of real work orders can be recognised as a price-list line. The durable route is a *table that maps our parts to price-list lines, learned from real quote history*, not fuzzy name-matching.
* **Track B**: measured how often quoted prices sit at the list price on seven accounts and split the book into three value modes: automate-now, enforce-the-rate, deprioritise. The debut is drawn from automate-now, where the value is already visible in the data.

# 3. The capabilities: projects & features

How the automation works is decided. The core idea is one system, not a fresh build per client: we build the pricing engine once, then switch it on for each client by loading their Schedule of Rates and setting a few options. The capabilities are grouped as projects (C1 to C5) with their features underneath. Only one hard dependency matters: the price list has to be usable by hand (C1) before the automatic matcher (C2) can learn from how people use it.

## Project C1: price lists as structured data in quoting  *(the foundation, and the biggest area)*

Get each client's Schedule of Rates into the tool as real, usable data, enough on its own to end PDF-hunting and guarantee the agreed price, before any automation.

* **Feature: price-list store & first loads.** Stand up the data structure that holds each client's list and links their repairs to it (shape decided in §6), and load the first two clients (Lindenhome and Meridian).
* **Feature: search & pick in the quote tool.** The account manager searches the client's list by name and inserts a line at the agreed price.
* **Feature: per-client formatting.** Show the line the way the client expects (one all-in price, or labour and parts split out).

**Opens up:** any client whose price list we've found. **Bonus:** every manual pick becomes a training example for C2.

## Project C2: automatic matching  *(the smart layer)*

Suggest the right price-list line for each repair automatically, so matching stops being manual.

* **Feature: the matcher.** A lookup that maps a repair part to the right price-list line, trained on past quotes plus the picks captured in C1.
* **Feature: in-tool suggestions.** Propose the line and price for each part with a confidence score; the account manager accepts or edits; no-match parts are flagged.
* **Feature: AI for the hard cases.** Resolve the uncertain leftovers, pushing coverage toward each client's realistic ceiling.

**Opens up:** higher coverage on existing clients, and cheap onboarding of new ones.

## Project C3: automatic quote assembly

Turn the matched lines into a complete draft quote automatically.

* **Feature: labour at the right rate.** Derive the labour for each matched part and price it for when the work happens (Lindenhome, for example, has a normal hourly rate and a surcharged one for nights, Sundays and public holidays).
* **Feature: full draft assembly.** Build the whole priced draft; the account manager reviews and sends instead of building it line by line.

**Value:** removes the biggest chunk of manual work; for the easy clients the quote all but writes itself.

## Project C4: harder pricing cases  *(everything beyond a clean fixed-price list)*

Handle clients whose pricing isn't a simple "look it up on the list." Two features, each unlocking a group of clients:

* **Feature: enforce the agreed price.** Flag or block lines priced away from the contracted rate, and track whether each line is on-rate, re-typed, or deliberately off-list. Unlocks clients where the list exists but people currently re-type prices (e.g. Foyer Francilien Habitat).
* **Feature: fixed mark-up (cost-plus) pricing.** Some clients have no fixed price per line; instead a line is priced as labour + materials with an agreed mark-up, a "fixed mark-up" kind of Schedule of Rates. Add that calculation, including coefficients that vary by amount or apply off-list. Unlocks cost-plus clients, including our biggest, Hollins Vale Housing (~€589k).

## Project C5: send controls & compliance

Manage what happens at the moment of sending. Two checks before a quote can go out: everything is matched and priced, and any required paperwork is attached. Plus a trust dial: quotes start out needing review before sending, and can move to sending automatically once a client's set-up has proven itself.

* **Feature: required-paperwork gate.** Where a contract demands proof before a quote goes out (first case: a supplier quote justifying an off-list cost), block sending until it's attached (§6). Unlocks compliance clients (CNPS, Palatine Authority) and is needed for clients using both pricing styles at once (Public Immo/PIM).
* **Feature: automatic sending.** Once a client's set-up has proven reliable, let its quotes send without a manual review step (judged per client; no fixed rule yet).

# 4. The roadmap: which clients, using which capabilities

The two sides fit together: once a capability is built, every client who needs it reuses it, so adding a new client is mostly loading their price list and setting a few options, not building again. Which capabilities each type of client needs (columns are features, grouped by project):

| Client type | C1 Price list | C2 Auto-match | C3 Full draft | C4 · enforce | C4 · mark-up | C5 · compliance |
| -- | -- | -- | -- | -- | -- | -- |
| Easy — price already used (Lindenhome, Meridian) — Milestone 1 | ● build | ● build | ● build | — | — | — |
| Another easy client — Milestone 2 | ○ reuse | ○ reuse | ○ reuse | ◐ if re-typed | — | — |
| Price exists but re-typed (Foyer Francilien Habitat) | ○ | ○ | ○ | ● build | — | — |
| Cost-plus (Brickyard, Hollins Vale Housing…) | ○ | ○ | ○ | ○ | ● build | — |
| Both styles / compliance (PIM, CNPS) | ○ | ○ | ○ | ○ | ○ | ● build |

● = built here · ○ = reused · ◐ = only if that client needs it. Reading down the list, each new client type adds just one more capability. Build once, add clients cheaply.

## How the accounts were chosen

Lindenhome and Meridian are the only accounts with a plain fixed-price list (no second pricing engine, no compliance paperwork, no choice between several catalogues) whose contract we have located and whose list we have extracted. Both already price much of their repair work off that list (Track B), so automation speeds up what people already do. Accounts were ranked on the repair revenue automation can realistically reach (revenue × adoption), not raw revenue, which is why the biggest SoR account, Hollins Vale Housing (Pattern A), comes later.

## Milestone 1: Lindenhome + Meridian  *(builds C1, C2, C3)*

Lindenhome already prices most repairs straight off its list and Meridian about half, so automating is low-risk: we're speeding up something that already works, not changing how people behave. They ship together because the engine is parameterised per account (per-account output configuration), so a second same-mode account is incremental, not a rebuild, and it lifts the headline adoption figure more. This milestone builds the core stack (C1–C3) and proves it. It lands in order:

1. **C1 on Lindenhome and Meridian:** both price lists in the tool, picked by hand. A win on its own: PDF-hunting gone, price guaranteed, and we start collecting matcher training data.
2. **C2:** automatic matching, trained on that data.
3. **C3:** labour + full draft quote, with a person still reviewing before send.

|  | Lindenhome | Meridian |
| -- | -- | -- |
| Country, currency | France, EUR | Singapore, SGD |
| Already prices off the list today (Track B) | 81% | 47% |
| How much we can auto-match (Track A) | 69% | not run |
| Pricing style | fixed price list | fixed price list |
| Repair revenue under this list | ~€103k | (supporting) |

**Main measure of success:** how much of Lindenhome + Meridian repair pricing now comes straight from the list (see §5), pushing both as high as they'll go. Revenue is supporting context. No compliance step needed (both use straightforward fixed prices).

## Milestone 2: a second easy (fixed-price-list) client  *(reuses C1–C3; adds C4 · enforce only if needed)*

After Milestone 1, the pool of "easiest, ready-to-build" clients is used up, so Milestone 2 is another straightforward fixed-price-list client of the same difficulty as the first two, so it's mostly loading their list and setting options on the stack already built. The remaining candidates were all set aside earlier for low usage or volume, so the pick waits until the Milestone 1 engine exists (§8). If none is worth it, step up to a harder client that draws on C4 instead.

## Milestone 3+: rough order, not fixed dates

Each later milestone is defined by the new capability it adds, in rising order of difficulty:

1. **C4 · enforce the agreed price**, where prices are currently re-typed.
2. **C4 · fixed mark-up (cost-plus).**
3. **C5 · compliance**, for clients that require paperwork before a quote goes out.
4. **C5 · automatic sending**, for the early clients that have proven reliable.

# 5. How we'll know it's working (measurement)

SoR adoption is measured at line-item grain, defined by *result*: a line counts when its final sent price traces to an unedited price-list match, so the measure does not depend on how the match was made and excludes CSM-overridden suggestions.

**Rollout % (north-star).** SoR-matched eligible line items ÷ *all* eligible line items company-wide (the full population of lines a contract prices). Starts low, fills toward 100%.

# 6. Foundations that carry across every milestone

## Data model shape

**Decided at the product-shape level.** The model is **separate per-contract price lists, unified by a per-account table that maps our parts to price-list lines, each pointing at a shared conceptual catalog. It is not a shared base price list with per-contract overrides** (contracts are near-totally heterogeneous; there is no shared *pricing* to override, only shared *concepts to match against*). It must represent, first-class: both pricing patterns incl. side-by-side dual-mechanism; labour rates by time band (weekday/night/weekend/holiday) as an expected field; off-list coefficients incl. coefficients banded by amount; labour derived from the matched part; per-account output configuration as data; per-line rate-conformance state; explicit no-match and name-aliasing/roll-up; effective-dated repricing/versioning; billing-trigger/chargeability scope.

Each account's evidence also carries a confidence tier (contract-read, CRM-inferred, mechanism-referenced with no table; see 02-taxonomy), which the model has to be able to record.

## Compliance / evidence gate

A later milestone (C5) adds a pre-send evidence check for cost-based lines; neither Lindenhome nor Meridian needs it.

# 7. Explicitly out of scope / deferred

* **Public Immo/PIM as a near-term milestone:** it prices with a fixed list *and* an off-list cost-plus engine, so it needs both C4 features and the paperwork gate, and waits for the milestone that adds C5.
* **Fixing the no-match fallback workflow:** the engine flags the no-match case; improving that investigative workflow (supplier-quote visibility, spec-sharing friction for non-technical CSMs) stays out.
* **Upstream auto-generation of the opportunity/quote itself:** a further automation step; the validated sequencing is downstream-first, then work backwards via the per-account table of parts to price-list lines.
* **Resourcing/staffing per milestone:** deferred.

# 8. Open items handed to the build project

* Detailed data-model schema (entities, cardinality, provenance/confidence), the concrete anchor catalog the per-account parts-to-lines tables point at, and the physical home (a new Salesforce object or a separate service).
* Which client Milestone 2 loads: another clean fixed-price list, picked by data once the Milestone 1 engine exists.
* The matching *implementation* inside C2 (the learned part → price-list-line lookup table).
* Per-contract compliance build specifics (Palatine Authority / PIM evidence formats, config UI & ownership, enforcement override rules).
* The rule for C5 automatic sending: when a client moves from CSM review before every send to sending without review, once there's history to calibrate one.
