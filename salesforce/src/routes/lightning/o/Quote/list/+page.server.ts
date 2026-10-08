import { org } from '#lib/server/org.ts';

/** Like a Salesforce list view: the first 50 rows, newest first. */
export const load = () => ({
	total: org().Quote.length,
	quotes: [...org().Quote]
		.sort((a, b) => b.CreatedDate.localeCompare(a.CreatedDate))
		.slice(0, 50)
		.map((q) => structuredClone(q))
});
