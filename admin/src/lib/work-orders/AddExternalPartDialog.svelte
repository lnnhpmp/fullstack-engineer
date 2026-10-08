<script lang="ts">
	import Dialog from '../ui/Dialog.svelte';
	import { addItem } from './api.ts';
	import { mutate } from './mutate.ts';

	let { open = $bindable(false), workOrderId, currency }: { open: boolean; workOrderId: string; currency: string } = $props();
	let description = $state('');
	let quantity = $state(1);
	let price = $state<number | null>(null);

	async function save() {
		if (await mutate(() => addItem({ workOrderId, type: 'EXTERNAL_PART', description, quantity, price: price ?? undefined }), 'External part added')) {
			open = false;
			description = '';
			quantity = 1;
			price = null;
		}
	}
</script>

<Dialog bind:open title="Add external part">
	<label><div>Description</div><textarea rows="3" bind:value={description}></textarea></label>
	<label><div>Quantity</div><input type="number" min="1" bind:value={quantity} /></label>
	<label><div>Supplier cost per unit ({currency})</div><input type="number" min="0" step="0.01" bind:value={price} /></label>
	<p class="grey">The supply team will match it to a catalogue part before a quote can be generated.</p>
	{#snippet actions()}
		<button onclick={() => (open = false)}>Cancel</button>
		<button class="primary" disabled={!description} onclick={save}>Add</button>
	{/snippet}
</Dialog>

<style>
	label {
		display: block;
		margin-bottom: 12px;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
	}
</style>
