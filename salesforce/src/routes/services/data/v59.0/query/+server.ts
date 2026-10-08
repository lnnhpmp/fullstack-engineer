import { json } from '@sveltejs/kit';
import { soql } from '#lib/server/org.ts';

export const GET = ({ url }) => json(soql(url.searchParams.get('q') ?? ''));
