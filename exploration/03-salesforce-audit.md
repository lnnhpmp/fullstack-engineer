# Schedules of Rates in Salesforce: data structure audit

## Question

What does a Schedule of Rates look like in Salesforce today?

## Findings

**No dedicated SoR object exists.** Nothing named Schedule of Rates, price list, rate card, or similar (in English or French) appears anywhere in the schema. Repair pricing runs entirely through the standard Salesforce quoting objects: Product2 (catalog) → PricebookEntry (a list price per Pricebook2) → QuoteLineItem (the actual line on a quote, which stores its own UnitPrice/Quantity/TotalPrice).

**No coefficient, labor-hour, or building-code field exists anywhere in this chain.** The only pricing-adjacent custom field holds a cost: Cost__c on QuoteLineItem.

**The "catalog" is a dumping ground, not a governed rate table.** Thousands of Product2 records are tagged Family = 'Repair', an order of magnitude more than a curated schedule of rates would contain. Recent repair quote lines show two patterns side by side:

* Generic, reused line types (Labour, Travel, Small parts, Chargeable Callout, Technician Visit) whose UnitPrice is typed fresh on almost every quote rather than pulled from a fixed rate: the "Labour" product alone appears at unit prices of 103, 82, 81, 125 and 103 across five different recent quotes.
* One-off Product2 records created per specific spare part (e.g. "MEC32 RELAY OUT(BOT)THRUPCA", "CB.CLASS 10 6.3-10A", "CB 400V 6KA 2 POLE C 1A (B)"), evidence that ops/reps mint a new "product" record per part rather than selecting from a maintained SKU list.

Net effect: creating a quote line today is effectively free-text entry with a Product2 record as a wrapper, not a lookup against a governed price. This confirms and sharpens the working assumption the CSMs voiced in interviews (05-field-notes). Beyond "ad hoc, no standardized database", the catalog keeps growing, is largely single-use, and the number that prices a line is manually typed at quote time regardless of what a PricebookEntry says.

**Pricebooks are per country, never per client.** No Salesforce object, pricebook or account carries a client- or contract-specific rate structure. Whatever pricing rules those contracts set today live outside Salesforce entirely (spreadsheets, PDFs, institutional knowledge).

**How a quote references pricing, concretely:** QuoteLineItem.PricebookEntryId → PricebookEntry.Product2Id → Product2, plus QuoteLineItem's own Quantity/UnitPrice/Discount fields. Two fields on the line override what the PDF prints for it: `QuotePdf_ProductName__c` (over the Product2 name) and `Quote_Line_Description__c` (the line's description).
