import { json } from '@sveltejs/kit';
import { ApexError, createQuote } from '#lib/server/org.ts';

export const POST = async ({ request }) => {
	const { r } = await request.json();
	try {
		return json(await createQuote(r));
	} catch (error) {
		if (error instanceof ApexError) return json([{ errorCode: 'APEX_ERROR', message: `AppException: ${error.message}` }], { status: 500 });
		throw error;
	}
};
