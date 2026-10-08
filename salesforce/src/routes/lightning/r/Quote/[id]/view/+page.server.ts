import { error, fail, redirect } from '@sveltejs/kit';
import {
	ADMIN,
	ApexError,
	STATUSES,
	addProductLine,
	changeStatus,
	cloneQuote,
	deleteLine,
	linesOf,
	linkedWorkOrdersOf,
	pricebook,
	quote,
	saveAllLines,
	updateLine
} from '#lib/server/org.ts';

export const load = ({ params }) => {
	const record = quote(params.id);
	if (!record) error(404, `No quote ${params.id}`);
	return {
		quote: structuredClone(record),
		lines: structuredClone(linesOf(params.id)),
		links: structuredClone(linkedWorkOrdersOf(params.id)),
		pricebook: structuredClone(pricebook(record.Pricebook2Id)),
		statuses: STATUSES,
		admin: ADMIN
	};
};

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();
const number = (form: FormData, key: string) => (text(form, key) === '' ? null : Number(text(form, key).replace(',', '.')));
const lineFields = (form: FormData) => ({
	Quantity: number(form, 'quantity') ?? 1,
	UnitPrice: number(form, 'unitPrice') ?? 0,
	Cost__c: number(form, 'cost'),
	Discount: number(form, 'discount')
});

/** Runs a change and turns an Apex error into a message on the page. */
async function attempt(change: () => unknown, message: string) {
	try {
		await change();
		return { message };
	} catch (e) {
		if (e instanceof ApexError) return fail(400, { message: e.message });
		throw e;
	}
}

export const actions = {
	status: async ({ params, request }) => {
		const status = text(await request.formData(), 'status');
		return attempt(() => changeStatus(params.id, status), `Status changed to ${status}.`);
	},
	clone: async ({ params }) => {
		redirect(303, `/lightning/r/Quote/${await cloneQuote(params.id)}/view`);
	},
	addProduct: async ({ params, request }) => {
		const form = await request.formData();
		return attempt(
			() =>
				addProductLine(params.id, {
					entryId: text(form, 'entryId') || null,
					name: text(form, 'name'),
					description: text(form, 'description') || null,
					pdfName: text(form, 'pdfName') || null,
					pdfDescription: text(form, 'pdfDescription') || null,
					...lineFields(form)
				}),
			'Quote Line Item was created.'
		);
	},
	updateLine: async ({ request }) => {
		const form = await request.formData();
		return attempt(
			() =>
				updateLine(text(form, 'lineId'), {
					...lineFields(form),
					QuotePdf_ProductName__c: text(form, 'pdfName') || null,
					Quote_Line_Description__c: text(form, 'pdfDescription') || null
				}),
			`Quote Line Item "${text(form, 'lineName')}" was saved.`
		);
	},
	saveAll: async ({ params, request }) => {
		const form = await request.formData();
		const { rows, deleted } = JSON.parse(text(form, 'payload'));
		return attempt(() => saveAllLines(params.id, rows, deleted), 'Your changes are saved.');
	},
	deleteLine: async ({ request }) => {
		const form = await request.formData();
		return attempt(() => deleteLine(text(form, 'lineId')), `Quote Line Item "${text(form, 'lineName')}" was deleted.`);
	}
};
