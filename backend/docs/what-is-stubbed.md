# What is stubbed

| Where | Stub |
| --- | --- |
| `deps.notify` | Emails and Slack messages are printed to the console. |
| `parts/commands/sync-part.ts` | Takes the ERP item as input instead of fetching it. |
| `../salesforce/` | A toy Salesforce: in-memory, loaded from the `salesforce` schema, one Repair pricebook per country, a flat 35% margin when a line has a cost but no price. |
| Work order completion and cancellation | `WorkOrder.complete()` and `cancel()` exist; the flows that call them are outside this slice. |
