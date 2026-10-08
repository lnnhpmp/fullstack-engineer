import { reset } from '#lib/server/org.ts';

/** Not Salesforce: `pnpm seed` calls this so the org matches the fresh database. */
export const POST = async () => {
	await reset();
	return new Response(null, { status: 204 });
};
