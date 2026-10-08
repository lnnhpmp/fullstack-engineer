// The admin talks to the backend's GraphQL API only. Nothing here reads Salesforce or the database directly.
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000';

export async function gql<T = any>(query: string, variables: Record<string, unknown> = {}, fetcher: typeof fetch = fetch): Promise<T> {
	const response = await fetcher(`${BACKEND}/graphql`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query, variables })
	});
	const { data, errors } = await response.json();
	if (errors?.length) throw new Error(errors.map((e: { message: string }) => e.message).join('\n'));
	return data;
}
