export type WorkOrderState =
	| 'PART_TO_ESTIMATE'
	| 'QUOTE_TO_SEND'
	| 'QUOTE_TO_SIGN_BY_CUSTOMER'
	| 'QUOTE_TO_VERIFY_PO'
	| 'WORK_TO_DO'
	| 'DONE'
	| 'DENIED'
	| 'CANCELLED';

export type QuoteStatus = 'DRAFT' | 'TO_SIGN' | 'VALIDATION' | 'SIGNED' | 'WORKS_IN_PROGRESS' | 'TO_BE_BILLED' | 'BILLED' | 'REFUSED';

export type ItemType = 'PART' | 'MAN_HOUR' | 'EXTERNAL_PART' | 'TECH_SUPPORT' | 'INSTALLATION';

export interface Part {
	id: string;
	sku: string;
	name: string;
	brand: string | null;
	averageCost: number | null;
}

export interface Item {
	id: string;
	type: ItemType;
	partId: string | null;
	part: Part | null;
	quantity: number | null;
	description: string | null;
	comment: string | null;
	/** What the item costs us. */
	price: number | null;
	sellPrice: number | null;
}

export interface Device {
	id: string;
	deviceNo: string;
	building: { id: string; name: string; city: string; countryCode: string; customer: { companyName: string } };
	contracts: { contract: { contractNo: string; type: string } }[];
}

export interface Quote {
	id: string;
	reference: string;
	number: string;
	status: QuoteStatus;
	grandTotal: number;
	currencyISOCode: string;
	emittedDate: string;
	description: string | null;
	accountName: string | null;
	documentAvailable: boolean;
}

export interface WorkOrder {
	id: string;
	workOrderNumber: string;
	workOrderType: string;
	urgencyLevel: string;
	state: WorkOrderState;
	title: string | null;
	description: string;
	isChargeable: boolean;
	createdAt: string;
	sfQuoteId: string | null;
	sfQuoteLink: string | null;
	quoteNumber: string | null;
	quoteStatus: QuoteStatus | null;
	quote: Quote | null;
	bundledWorkOrders: { id: string; workOrderNumber: string; device: { deviceNo: string } | null }[];
	device: Device | null;
	items: Item[];
}
