import { invalidateAll } from '$app/navigation';
import { notify } from '../snackbar.svelte.ts';

/** Runs a mutation, tells the user how it went, and reloads the page data. */
export async function mutate(action: () => Promise<unknown>, success = 'The change has been saved'): Promise<boolean> {
	try {
		await action();
		notify(success);
		return true;
	} catch (error) {
		notify((error as Error).message, true);
		return false;
	} finally {
		await invalidateAll();
	}
}
