const CURRENCY: Record<string, string> = { FR: 'EUR', PT: 'EUR', GB: 'GBP', SG: 'SGD', HK: 'HKD' };

export const currencyOf = (countryCode: string | undefined) => CURRENCY[countryCode ?? ''] ?? 'EUR';

export const money = (amount: number | null | undefined, currency: string) =>
	amount == null ? '--' : new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);

export const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB');
