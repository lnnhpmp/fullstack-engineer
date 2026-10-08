import { json } from '@sveltejs/kit';
import { searchProducts } from '#lib/server/org.ts';

/** What the Add Product flow's search component asks for as you type. */
export const GET = ({ params, url }) => json(searchProducts(params.id, url.searchParams.get('q') ?? ''));
