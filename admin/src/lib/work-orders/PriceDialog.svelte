<script lang="ts">
	import type { Item } from '../types.ts';
	import Dialog from '../ui/Dialog.svelte';
	import { updateItem } from './api.ts';
	import { mutate } from './mutate.ts';

	let { item, currency, workOrderId, onclose }: { item: Item | null; currency: string; workOrderId: string; onclose: () => void } = $props();
	let open = $state(false);
	let price = $state<number | null>(null);

	$effect(() => {
		open = !!item;
		price = item?.price ?? null;
	});
	$effect(() => {
		if (!open && item) onclose();
	});

	async function save() {
		if (item && price != null && (await mutate(() => updateItem({ workOrderId, itemId: item!.id, price: price! })))) open = false;
	}
</script>

<Dialog bind:open title="Edit price">
	<label>
		<div>Cost per unit ({currency})</div>
		<input type="number" min="0" step="0.01" bind:value={price} />
	</label>
	{#if item?.part?.averageCost != null}<p class="grey">Average cost of this part: {item.part.averageCost}</p>{/if}
	{#snippet actions()}
		<button onclick={() => (open = false)}>Cancel</button>
		<button class="primary" disabled={price == null} onclick={save}>Save</button>
	{/snippet}
</Dialog>
