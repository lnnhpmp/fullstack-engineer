# Schema history

The app creates its tables from the entities (`synchronize`). This is when each
table, and the columns that matter, first appeared in production. Tables and
columns carry this slice's names.

| Date | Schema | Table / column | Why |
| --- | --- | --- | --- |
| 2021-01-05 | users | `customer` | customer accounts |
| 2021-06-08 | contracts | `contract`, `contract_device` | contracts and the devices they cover |
| 2021-11-24 | devices | `device` | device registry |
| 2022-08-17 | buildings | `building` | building registry |
| 2022-09-19 | workorders | `quote_events` | event stream per Salesforce quote, keyed by its Salesforce id. Not every quote comes from a work order: other flows (mission billing, for instance) create Salesforce quotes directly, and their status events land in this table too. |
| 2022-09-26 | workorders | `quote_events.type` += `quote-refused` | refused quotes |
| 2022-10-25 | workorders | `quote` | projection of Salesforce quotes |
| 2023-02-10 | workorders | `work_order`, `work_order_item` | work orders and their items (then `repair_request`, `request_item`); older work orders, back to 2022-02, were migrated in with their original dates |
| 2023-02-14 | workorders | `work_order_event` | work orders become event sourced |
| 2023-03-17 | workorders | `work_order_item.type` (PART, MAN_HOUR) | item kinds |
| 2023-04-25 | workorders | `part` | parts catalogue synced from the ERP |
| 2023-08-30 | workorders | `work_order_item.type` += EXTERNAL_PART, TECH_SUPPORT | item kinds |
| 2023-10-24 | workorders | `work_order_item.price` | item cost |
| 2023-11-03 | workorders | `work_order.workOrderNumber` | human-readable number |
| 2023-12-05 | workorders | `work_order.sfQuoteId`, `quoteStatus` | link to the Salesforce quote |
| 2023-12-28 | workorders | `work_order.state` | business state for the admin |
| 2024-12-06 | contracts | `contract_device.startDate`, `endDate` | per-device contract periods |
| 2025-09-19 | workorders | `work_order.workOrderType` | repairs, callouts and shutdowns |
| 2026-04-09 | workorders | `work_order_item.type` += INSTALLATION | installation items |
| 2026-04-17 | workorders | `work_order_item.sellPrice` | sell price on items |
