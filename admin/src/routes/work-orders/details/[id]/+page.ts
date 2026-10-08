import { error } from '@sveltejs/kit';
import { getWorkOrder } from '#lib/work-orders/api.ts';

export const load = async ({ params, fetch }) => {
	const workOrder = await getWorkOrder(params.id, fetch);
	if (!workOrder) error(404, `No work order ${params.id}`);
	return { workOrder };
};
