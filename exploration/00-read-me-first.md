# Read me first

Everything you need to read the rest of this folder without having worked here.

## What WeMaintain does

WeMaintain maintains lifts, escalators and automatic doors for building owners and managers in France, the UK, Hong Kong, Singapore and Portugal. Most revenue is maintenance under contract: a flat fee per device per year. On top of that, **repairs** (a part to replace, a door to fix, a compliance upgrade) are quoted and billed one by one. Growing that repair business is the company's current top goal.

## Who quotes a repair, and where

1. A **technician** finds a problem on site (a breakdown, a worn part, a finding from an inspection report) and opens a **work order** in our app.
2. The work order holds **work-order items**, each typed: `PART` (a part from our catalogue, which is synced from the ERP that holds parts and their costs), `MAN_HOUR` (labour), `EXTERNAL_PART` (something we buy from a supplier), `INSTALLATION` or `TECH_SUPPORT`. The names are the ones in `backend/`.
3. A **CSM** (customer success manager, also called the account manager) picks the work order up in **the admin**, our internal back office, works out the price, and turns it into a **quote**.
4. The quote lives in **Salesforce** as a `Quote` with one `QuoteLineItem` per priced line. The client accepts or refuses it there; accepted quotes go on to billing.

Pricing a line is the slow part. For most clients the CSM uses our standard prices. For clients with a Schedule of Rates, the price is fixed by contract, and today the CSM finds it in a PDF and types it in.

## Schedule of Rates

A **Schedule of Rates (SoR)** is the list of repair prices a client negotiated into their contract: "replace a landing button: €X", "labour at night: €Y/h", "parts not on this list: supplier cost × 1.41". Large clients, and public bodies that buy through tenders, insist on one so every repair quote is predictable and checkable against the contract. Some lists are fixed prices per operation (Pattern B in the taxonomy); others are only a labour rate plus a mark-up on parts (Pattern A).

The lists of the two accounts the roadmap loads first are in `price-lists/`, as each contract prints them: `lindenhome-price-list.csv` (France) and `meridian-sor-table-a.csv` (Singapore, 81 items, each priced in three time bands). The clauses that sit around each table are in `price-lists/README.md`.

## The WIG

The company's Wildly Important Goal: **grow the booked repair backlog**, the value of repair work clients have accepted.

## Glossary

| Term | Meaning |
| -- | -- |
| **SoR** | Schedule of Rates: a client's contractual repair price list. French contracts call it a BPU; these documents say SoR or price list. |
| **Account / customer / client** | One and the same: an *account* in Salesforce, a *customer* in the backend (`users.customer`), a "Client" in the admin. |
| **Booked / billed** | Booked revenue is the value of quotes the client has accepted. Billed revenue is the part of it already invoiced. The WIG counts booked. |
| **Pattern A / B** | Fixed mark-up (no list) / fixed price list. See 02-taxonomy. |
| **Coefficient** | A multiplier applied to a cost for anything not on the list (e.g. supplier invoice × 1.41). |
| **Surcharge** | A higher price or hourly rate for work at night, on Sundays or on public holidays. |
| **Time band** | When the work happens (office hours, evenings, Sundays and holidays, …). Some lists price labour, or every line, per time band. |
| **Confidence tier** | How solid the evidence for an account's price list is: contract-read, CRM-inferred, or mechanism-referenced with no table (02-taxonomy). |
| **Star Rates** | In the Meridian contract: rates for work that Table A does not list, agreed when needed. The contract sets a 10% adjustment on them (see `price-lists/README.md`). |
| **Anchor catalog** | The shared list of repair concepts (a part or an operation). Each account gets a table that maps our parts (or work-order items) to its price-list lines, and every account's table points at this one list. |
| **Track A / B** | The two data validations run before the roadmap. See 04-validation-tracks. |

## Reading order

1. This page.
2. **01-roadmap.md**: the plan, the projects, the milestones, and the open questions handed to the build. The heart of the pack.
3. **02-taxonomy.md**: how each client's Schedule of Rates prices a repair.
4. The rest, as reference: 03-salesforce-audit (what quoting data looks like today), 04-validation-tracks (the data behind the account choice), 05-field-notes (the people who quote), and `price-lists/`.
