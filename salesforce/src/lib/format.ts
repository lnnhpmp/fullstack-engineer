/** As the org shows money to a French-locale user: "EUR 841,50". */
export const money = (amount: number | null | undefined, currency: string) =>
	amount == null ? '' : `${currency} ${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const decimal = (value: number | null | undefined) =>
	value == null ? '' : value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const percent = (value: number | null | undefined) => (value == null ? '' : `${decimal(value)} %`);

export const date = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '');

export const dateTime = (iso: string | null | undefined) =>
	iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

export const addDays = (iso: string, days: number) => new Date(Date.parse(iso) + days * 86_400_000).toISOString();
