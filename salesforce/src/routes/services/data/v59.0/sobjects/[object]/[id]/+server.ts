import { json } from '@sveltejs/kit';
import { ApexError, updateRecord } from '#lib/server/org.ts';

export const PATCH = async ({ params, request }) => {
	try {
		updateRecord(params.object, params.id, await request.json());
		return new Response(null, { status: 204 });
	} catch (error) {
		if (error instanceof ApexError) return json([{ errorCode: 'NOT_FOUND', message: error.message }], { status: 404 });
		throw error;
	}
};
