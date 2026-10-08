import { error } from '@sveltejs/kit';
import { linesOf, quote } from '#lib/server/org.ts';

export const load = ({ url }) => {
	const id = url.searchParams.get('quoteId') ?? '';
	const record = quote(id);
	if (!record) error(404, `No quote ${id}`);
	return { quote: structuredClone(record), lines: structuredClone(linesOf(id)) };
};
