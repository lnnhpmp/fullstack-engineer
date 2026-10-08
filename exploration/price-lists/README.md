# Price lists

The two lists Milestone 1 loads, one row per printed line. Prices exclude
VAT/GST. The clauses printed around each table are below, because they change
how a price is applied.

## Lindenhome: `lindenhome-price-list.csv`

The schedule of unit prices for works, annex 2 to the works contract for lot 4
(one part of a public tender, awarded as its own contract).
EUR, excluding VAT. The document states no validity period and no indexation
clause.

In the data, Lindenhome is two customers, Lindenhome PM and Lindenhome AL: most
of PM's contracts end the day AL's first contract starts. The exploration
treats them as one account, but this list is Lindenhome AL's. Lindenhome PM's
older quotes were priced under its earlier contract, whose list is not in this
folder (its labour shows at 73.35 in the data).

A "supplement or deduction" line is an amount added to or taken off a base line
(per extra level, for example).

- Header of the price list: "Works are carried out with reference to the
  technical specification and its Annex 5 technical descriptions. Where there
  is no description sheet, approved standards or recognised good practice
  apply in full. The prices in this list are deemed to include the labour,
  supply, removal, disposal, waste treatment and fitting of the items named."
- `0001AS` / `0002AS`: the hourly labour rate, normal (€103.72/h) and
  surcharged (€108.97/h: night from midnight to 6am, Sunday, public holiday).
  Travel is included.
- Section `COEFFICIENT`: multipliers "to apply to the invoice (to be
  provided)", on the supplier's or subcontractor's invoice, for work the list
  does not price: 1.41 on a part not on the list, 1.31 on subcontracted work.
- Section `DEDUCTIONS`: volume discounts per order of the same part reference.
- `comment` holds the second half of the designation cell where the list
  prints one (the scope of the operation, or "state the supplement on the
  previous lines").

## Meridian: `meridian-sor-table-a.csv`

Section V "Schedule of Rates", Table A, of the sibling malls' maintenance
agreements (02-taxonomy says which accounts). SGD, excluding GST. Valid for the whole five-year
contract term.

- Time bands, as the table header prints them:
  - Office hours: Mon–Fri 0830–1800, Sat 0830–1330.
  - After office hours: Mon–Fri 1801–0829, Sat 0001–0829.
  - Sat 1331–midnight, the whole of Sunday and public holidays.
- Items 67–73 (statutory load tests and endorsements) print one rate across
  all three bands.
- Star Rates (clause 1): "Star Rates Items — Percentage Adjustment to Star Rate
  items is 10%." No row of Table A is marked as a Star Rate item.
- Clause 2.i: "All rates in the Schedule shall include supply and delivery of
  all materials and goods including material, wastage, labour for installation
  / replacement, scaffolding, workmanship, tools, equipment, machinery,
  transportation charges […], overhead charges […] and all things necessary for
  the full completion and make good of works as directed by the Client unless
  specifically excluded."
- Clause 2.vi: the Star Rates adjustment and Table A apply to both the client
  and its tenants.
