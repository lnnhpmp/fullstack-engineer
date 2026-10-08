import { products } from '#lib/server/org.ts';

export const load = () => structuredClone(products());
