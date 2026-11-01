export type MockBand = { id: string; label: string; price: number };

export type MockKind = 'LINE' | 'LABOUR_RATE';

export type MockLine = {
	id: string;
	code: string;
	designation: string;
	unit: string;
	kind: MockKind;
	price?: number;
	bands?: MockBand[];
};

export type MockPriceList = {
	key: 'lindenhome' | 'meridian';
	client: string;
	country: string;
	currency: string;
	note: string;
	lines: MockLine[];
};

export const LINDENHOME: MockPriceList = {
	key: 'lindenhome',
	client: 'Lindenhome AL',
	country: 'France',
	currency: 'EUR',
	note: 'Parts are one all-in price; labour is banded (normal / surcharged).',
	lines: [
		{ id: 'l-0009', code: '0009AS', designation: 'Inspection control box on car roof', unit: 'each', kind: 'LINE', price: 517.97 },
		{ id: 'l-0010', code: '0010AS', designation: 'Stop button on car', unit: 'each', kind: 'LINE', price: 111.8 },
		{ id: 'l-0015', code: '0015AS', designation: '230V socket on and under car', unit: 'each', kind: 'LINE', price: 208.35 },
		{ id: 'l-0020', code: '0020AS', designation: 'Rail brakes', unit: 'each', kind: 'LINE', price: 2698.37 },
		{ id: 'l-0030', code: '0030AS', designation: 'Fixed car-roof balustrade, 1 side', unit: 'each', kind: 'LINE', price: 734.87 },
		{ id: 'l-0003', code: '0003AS', designation: 'Daily rate for setting up a goods-carrying service', unit: 'per day', kind: 'LINE', price: 99.6 },
		{
			id: 'l-0001',
			code: '0001AS',
			designation: 'Labour — hourly rate (travel included)',
			unit: 'hour',
			kind: 'LABOUR_RATE',
			bands: [
				{ id: 'l-0001-n', label: 'Normal', price: 103.72 },
				{ id: 'l-0001-s', label: 'Surcharged (night · Sunday · public holidays)', price: 108.97 }
			]
		}
	]
};

export const MERIDIAN: MockPriceList = {
	key: 'meridian',
	client: 'Meridian',
	country: 'Singapore',
	currency: 'SGD',
	note: 'Every line is priced in three time bands; pick the band.',
	lines: [
		{
			id: 'm-1',
			code: '1',
			designation: 'ARD Battery 65AH - 4 x 12 AH',
			unit: 'Per Set',
			kind: 'LINE',
			bands: [
				{ id: 'm-1-o', label: 'Office hours', price: 588.0 },
				{ id: 'm-1-a', label: 'After office hours', price: 705.0 },
				{ id: 'm-1-s', label: 'Sat pm · Sun · public holidays', price: 705.0 }
			]
		},
		{
			id: 'm-2',
			code: '2',
			designation: 'ARD Battery 65AH - 4 x 28 AH',
			unit: 'Per Set',
			kind: 'LINE',
			bands: [
				{ id: 'm-2-o', label: 'Office hours', price: 588.0 },
				{ id: 'm-2-a', label: 'After office hours', price: 705.0 },
				{ id: 'm-2-s', label: 'Sat pm · Sun · public holidays', price: 705.0 }
			]
		},
		{
			id: 'm-6',
			code: '6',
			designation: 'Brake unit without switch',
			unit: 'Per Pc',
			kind: 'LINE',
			bands: [
				{ id: 'm-6-o', label: 'Office hours', price: 1437.0 },
				{ id: 'm-6-a', label: 'After office hours', price: 1763.0 },
				{ id: 'm-6-s', label: 'Sat pm · Sun · public holidays', price: 1763.0 }
			]
		},
		{
			id: 'm-7',
			code: '7',
			designation: 'Car guide shoe',
			unit: 'Per Pc',
			kind: 'LINE',
			bands: [
				{ id: 'm-7-o', label: 'Office hours', price: 235.0 },
				{ id: 'm-7-a', label: 'After office hours', price: 313.0 },
				{ id: 'm-7-s', label: 'Sat pm · Sun · public holidays', price: 313.0 }
			]
		},
		{
			id: 'm-70',
			code: '70',
			designation: 'Standby labour — technician (statutory)',
			unit: 'Per hour',
			kind: 'LABOUR_RATE',
			bands: [
				{ id: 'm-70-o', label: 'Office hours', price: 120.0 },
				{ id: 'm-70-a', label: 'After office hours', price: 120.0 },
				{ id: 'm-70-s', label: 'Sat pm · Sun · public holidays', price: 120.0 }
			]
		}
	]
};

// Resolve the account's price list by customer id (mock: hardcoded from the anonymised ids).
export const CUSTOMER_PRICE_LISTS: Record<number, MockPriceList> = {
	44889: LINDENHOME, // Lindenhome AL
	87050: MERIDIAN, // Serava Mall LLP
	80174: MERIDIAN, // Meridian Property North Gem
	89840: MERIDIAN, // Meridian Property Lumière
	43375: MERIDIAN, // Ardmoor (Meridian Lumière Trust)
	73295: MERIDIAN, // Meridian - Kembang 1
	86663: MERIDIAN // MR Retail Trustee
};

export const priceListForCustomer = (customerId: number): MockPriceList | null => CUSTOMER_PRICE_LISTS[customerId] ?? null;
