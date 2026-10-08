import { deserialize } from '$app/forms';
import { goto, invalidateAll } from '$app/navigation';
import { showToast } from '../ui/toast.svelte.ts';

/**
 * Posts to one of the record page's form actions and reports the outcome as a Lightning toast.
 * Resolves to true on success, or to the error message (also toasted unless `quiet`).
 */
export async function act(action: string, fields: Record<string, unknown> = {}, quiet = false): Promise<true | string> {
	const body = new FormData();
	for (const [key, value] of Object.entries(fields)) body.append(key, value == null ? '' : String(value));
	const response = await fetch(`?/${action}`, { method: 'POST', body, headers: { 'x-sveltekit-action': 'true' } });
	const result = deserialize(await response.text());
	if (result.type === 'redirect') {
		await goto(result.location);
		return true;
	}
	if (result.type === 'success') {
		if (result.data?.message) showToast(String(result.data.message));
		await invalidateAll();
		return true;
	}
	const message = result.type === 'failure' ? String(result.data?.message) : 'An unexpected error occurred.';
	if (!quiet) showToast(message, 'error');
	return message;
}

export const notInToy = (what: string) => showToast(`${what} is not available in the toy org.`, 'info');
