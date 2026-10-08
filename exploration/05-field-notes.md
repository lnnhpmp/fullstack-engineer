# Field notes: how quotes get made today

Shadowing sessions and interviews with the people who build repair quotes, condensed.

## The CSM's queue (France)

**CSM 1, interview.**

* Quotes come from three sources: direct customer enquiries, technicians' work orders, and findings from inspection offices (the independent bodies that inspect lifts).
* Work order quality varies; missing information slows the quote down.
* **Price lists simplify quote creation but need better access to product references and supporting documents.**
* Not every customer wants the same detail: some want a simple quote, others a technical justification report.

**CSM 2, shadowing on an RVF quote.**

* Quoting depends on prioritisation and context, not a simple queue: equipment downtime, technician feedback, recurring failures, customer context, likelihood of approval. Quotes are often prepared and sent in batches.
* **The Schedule of Rates is a major enabler.** With an item on the SoR, a CSM can quote without fully understanding the technical repair. Without it: understand the intervention, request supplier quotes, chase missing technical information.
* People compensate for friction with personal workarounds: saved snippets, keyboard shortcuts, email templates, personal tracking sheets.
* The equipment number is the identifier the team trusts; flows organised by location instead of equipment number cost effort.
* Missing photos, details, causes and context on the work order mean more investigation and supplier back-and-forth.
* Insurance items (findings from inspection reports) need technical interpretation; SoR items make them easy, non-SoR items need expertise and supplier coordination.

**CSM 3, interview.**

* Quote creation is a chain of manual steps: typing building codes, rewriting descriptions, adding the price-list lines one by one.
* No standardised parts/price-list database in Salesforce, so the same information is re-typed again and again.
* Work orders and supplier quotes sometimes lack what is needed to apply the contract coefficients correctly (*"1.41 on parts and 1.31 on labour"*). By "labour" the CSM means subcontracted labour: at Lindenhome, 1.41 applies to the supplier's invoice for a part not on the list, and 1.31 to the subcontractor's invoice for subcontracted work.

**CSM 1 and CSM 2, workshop on insurance items.**

* **Price-list constraint:** CSM 2 has one very strict price-list client (Palatine Authority) that requires a supplier quote to justify margins. Supplier quotes are not systematically attached to work orders, which blocks quoting.

## Singapore

**The Singapore ops lead, interview.**

* Meridian has a yearly repair budget of **600k SGD**; the team works with them to identify needs, mostly handrail replacements, decided today on visual inspection.
* Elsewhere the focus is new units and **compliance items**, which he sees as the bulk of the opportunity: emergency battery-operated power supplies, supervisory panels, 3-way intercoms.
* **He insisted on managing contractual schedules of unit prices, because pricing varies by contract even for compliance items.**

## Billable breakdowns (France, earlier interviews)

**Ops engineer 1 and ops engineer 2, interview.**

* Billable breakdowns are vandalism or misuse. Some clients have "small vandalism" included. On the fire-safety systems side, everything is billable.
* Standard labour then: 82 €/h commercial, 88 €/h residential; **"big clients with price lists: different prices"**.

**The fire-safety systems lead, interview.**

* Fire-safety flow: on site, repair (often with a part from the van), an intervention slip signed on site, a work order with labour hours, then the sales admin creates the opportunity and quote in Salesforce and moves it straight to "to be billed".
* They don't know the labour price for every client. **One client (CNPS) has a price list with fixed rates; to reach the same total, they increase the number of hours.**
