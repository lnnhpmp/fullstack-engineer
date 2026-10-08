# SoR mechanisms: taxonomy

How each client's Schedule of Rates prices a repair. Scope is repair and chargeable-extra pricing only: maintenance billing is a flat fee, already structured in Salesforce, and out of scope (see "Out of scope" at the bottom).

## Summary

### SoR patterns

| Pattern | What it is | Accounts |
| -- | -- | -- |
| **A. Fixed mark-up** | Quote assembled at time of request from a labour rate (sometimes priced by time band) and, where present, a cost-plus mark-up on materials: no fixed list. Lump-sum quotes are typically contractually rejectable. | Brickyard, Larkfield, KBU, Lockwell, Hollins Vale Housing, Hotelia/Brightstay (dual), Verdier Real Estate, Public Immo (dual) (8) |
| **B. Fixed price list** | A literal, numeric lookup table of prices per part/operation, fixed for the contract term, optionally with an off-list coefficient/mark-up rule for anything not itemised. | 16 accounts, see the table below |

### Attributes (layered on top of Pattern A or B, not separate mechanisms)

| Attribute | Meaning | Seen at |
| -- | -- | -- |
| **Billing trigger** | The rate card applies only to work triggered by a specific cause (misuse, vandalism, obsolescence), not to all repair work. It answers why a repair is chargeable, not how much to charge, and should get its own flag in the data model. | Lockwell, Hollins Vale Housing (Pattern A); TLR (Pattern B) |
| **Time bands** | The rate or price steps up with when the work happens (weekday / Saturday / Sunday and holiday / night). Most accounts band labour only; Meridian bands every line. Routine in French public and semi-public price lists and in UK managing-agent contracts, so the data model should decide whether to treat labour rates by time band as an expected field rather than an optional flag. | Lockwell, Verdier Real Estate (Pattern A); Lindenhome, Singapore – The Aurelian, both RVF contracts, Meridian (Pattern B) |
| **Dual mechanism** | One contract carries both a Pattern A schedule and a Pattern B list, each fully populated, covering different repair scenarios rather than one nested in the other. | Hotelia/Brightstay UK Hotels 1 Limited; Public Immo |
| **Repricing cadence** | The table reprices periodically (an indexation clause, an annual review) rather than staying fixed for the whole contract term. Per the Global VP of Operations, "price lists are normally revalued every year, so prices change", which is normal practice for French price lists. The data model should decide whether to default this to "likely annual, unconfirmed" for Pattern B accounts rather than read a missing clause as "confirmed fixed". | TLR, Foyer Francilien Habitat, both RVF contracts (contract-confirmed); Verdier Real Estate (annual review capped at the RPI inflation index); Public Immo (unknown) |

### Confidence tiers (Pattern B only)

How solid the evidence for an account's list is, strongest first: **contract-read** (we read the contract and its table), **CRM-inferred** (only the quote history in Salesforce suggests a list), **mechanism-referenced, no table** (the contract refers to a list we have not found). This tag travels with each account into the data model (roadmap §6).

### Accounts at a glance

| Account | Pattern | Confidence | Country | Attributes / notes |
| -- | -- | -- | -- | -- |
| Brickyard | A | Contract-read | UK |  |
| Larkfield | A | Contract-read | UK |  |
| KBU | A | Contract-read | UK |  |
| Lockwell | A | Contract-read | UK | Billing trigger, time bands |
| Hollins Vale Housing | A | Contract-read | UK | Billing trigger |
| Hotelia / Brightstay UK Hotels 1 Limited | A + B | Contract-read | UK | Dual mechanism |
| Verdier Real Estate | A | Contract-read | UK / France | Capped mark-up, labour by time band |
| Lindenhome | B | Contract-read | France | Time bands (labour) |
| Singapore – The Aurelian | B | Contract-read | Singapore | Time bands (standby labour) |
| RVF, lift maintenance | B | Contract-read | France | Time bands (labour surcharges); repricing cadence (annual, index-linked) |
| RVF, automatic doors | B | Contract-read | France | Not lifts; coefficient banded by amount |
| Public Immo | A + B | Contract-read | France | Dual mechanism: a price list plus an off-list cost-plus engine |
| TLR / Corvane Riverside | B | Contract-read | UK | Billing trigger; repricing cadence (indexed annually on CPI, an inflation index) |
| Meridian Property Retail Management (parent, 15 sibling accounts) | B | Contract-read | Singapore (SGD) | Time bands (every line) |
| Valmont Invest (whole account, 8 property companies) | B | Contract-read | France | Coefficient outside normal hours |
| Foyer Francilien Habitat / Foyer Francilien Habitat Social | B | Contract-read | France | Two catalogues; repricing cadence (index-linked) |
| WonderFull Paris | B | Contract-read | France | Not lifts (see "Out of scope") |
| Palatine Authority | B | Mechanism-referenced, no table | France | Public authority; compliance (supplier quote required to justify margins, 05-field-notes) |
| CNPS | B | Mechanism-referenced, no table | France | Public health-insurance body; compliance |
| Ashvale Borough Council | B | CRM-inferred | UK | Single product signal |
| Brookmere Homes | B | CRM-inferred | UK | Single product signal |
| Cité administrative | B | CRM-inferred | France |  |

## Detail

### Pattern A: fixed mark-up

Quote is assembled at time of request from defined inputs (a labour rate, sometimes priced by time band, and, where present, a cost-plus mark-up rule on materials, billed at cost with the mark-up applied after) rather than looked up from a fixed table. Contract mandates itemisation; lump-sum quotes are rejectable.

* **Brickyard**: a rate card rather than a price list, with an hourly rate per labour category and a mark-up rate on parts and materials. The client mandates an itemised breakdown.
* **Larkfield**: a labour rate cap; no materials mark-up found.
* **KBU**: hours × a schedule of charging rates, materials at cost plus a mark-up; KBU sees the underlying invoice.
* **Lockwell**: a minimum call-out charge plus hourly labour by time band (weekday, Saturday, Sunday and holiday).
* **Hollins Vale Housing**: an out-of-hours labour rate and a capped misuse/abuse waiver. Per the account CSM, the real chargeable-extras rule is a mark-up on materials, which the CSM applies by hand when quoting; it is not written in any separate document. The client is actively disputing chargeability, so this is a weak practical automation candidate.
* **Hotelia / Brightstay UK Hotels 1 Limited**: labour at a normal-hours and an out-of-hours rate, plus a mark-up on materials and on sub-contractor management. The same contract also carries a Pattern B list (dual mechanism).
* **Verdier Real Estate** (UK & France sub-accounts, one contract per building): each building's pricing schedule caps the mark-up on materials and on sub-contracted works, sets hourly labour by time band, and requires every quote itemised into parts + labour.
* **Public Immo**: the off-list side of its dual mechanism, with materials at cost times a coefficient, plus its own hourly labour rate, run through supplier quotes the account CSM sends the client by hand.

### Pattern B: fixed price list

A literal, numeric lookup table of prices per part/operation code, fixed for the contract term. Optionally carries an off-list coefficient/mark-up rule for anything not itemised (Lindenhome, WonderFull Paris, Public Immo).

**Contract-read:**

* **Lindenhome**: fullest example, a ~390-line price list + coefficients and volume discounts, plus labour priced by time band. It is two customers in the data; `price-lists/README.md` says which one the list belongs to.
* **Singapore – The Aurelian**: a SoR for statutory/compliance and out-of-scope items, with standby labour in 3 time bands, alongside a flat maintenance fee.
* **RVF, lift maintenance.** Two RVF departments' accounts and a plain "RVF" account all quote against it. Per-part supply + labour pricing, with night/Saturday/Sunday/holiday surcharges; prices revised annually against official cost indices.
* **RVF, automatic doors.** A separate contract for a different product line: a supply price list, labour at a weekday and a weekend rate, and a resale coefficient banded by amount.
* **Public Immo**: the list side of its dual mechanism, with lift and platform-lift repair & replacement lines, each carrying a materials cost, a labour rate and a total unit price. Whether it has an indexation clause is unknown.
* **TLR / Corvane Riverside**: ~24 flat unit-cost lines for lift parts/repairs, covering only misuse/vandalism/end-of-design-life work; indexed annually on CPI.
* **Hotelia / Brightstay UK Hotels 1 Limited**: 56 numbered fixed-price repair items, beside its Pattern A schedule.
* **Meridian Property Retail Management Pte. Ltd.** (Singapore retail-mall portfolio, SGD, a parent account over 15 sibling accounts): "Section V — Schedule of Rates," "TABLE A": 81 numbered line items for lift/escalator/travelator parts, standby labour, statutory testing, and major-component replacement. Every line item carries 3 time-band prices plus a "Star Rates" clause of 10% (see price-lists/). Three siblings' contracts were read (Meridian Property Lumière Pte. Ltd., Serava Mall LLP, MR Retail Trustee Pte Ltd) and their tables are identical; the list is treated as the standard SoR for all 15. The data has no parent link between accounts, and the parent itself is not in it. The siblings you can identify are the four accounts with Meridian in their name (Meridian Property Lumière Pte. Ltd.; Meridian Property North Gem Trustee Pte Ltd; Meridian - Kembang 1 LLP; Ardmoor Trust Services (Singapore) Ltd As Trustee Of Meridian Lumière Trust) plus Serava Mall LLP and MR Retail Trustee Pte Ltd.
* **Valmont Invest** (8 property companies): a fixed-price catalogue plus an hourly labour rate, with a coefficient for work outside normal hours, applied to the whole account. The property companies are not separate accounts in the data.
* **Foyer Francilien Habitat / Foyer Francilien Habitat Social**: two catalogues, routine upkeep and major works, each with its own surcharge, plus two flat hourly rates; prices revisable against French cost indices.
* **WonderFull Paris**: ~70 lines of automated-opening equipment; anything off the list is billed at cost times a coefficient, quote-validated by the client.

**Mechanism referenced by contract clause, table not yet located:**

* **Palatine Authority** (not in the data): the price-list template hasn't been found. The account CSM describes it as a very strict client that requires a supplier quote to justify margins (05-field-notes).
* **CNPS** (sites run by an energy-services contractor): hourly-rate price list referenced by name, no figures.

## Out of scope

* **Maintenance pricing mechanisms** (fixed-price catalogue per device/category, or fixed price per numbered device): a flat fee, already structured in Salesforce, quoted once per contract lifecycle, nothing to automate.
* **Accounts with no populated rate card, or a list for another product line.** The same account can have one in-scope, priced list and one out-of-scope or unpriced annex for a different equipment line, so don't assume one account = one product line. **Exception:** WonderFull Paris (automated openings, not lifts) is kept in Pattern B, a one-off inclusion rather than a general rule change.
