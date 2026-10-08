<script lang="ts">
	import type { WorkOrder } from '../types.ts';
	import Dialog from '../ui/Dialog.svelte';
	import { findDraftQuotesInBuilding, pushQuoteToSalesforce } from './api.ts';
	import { mutate } from './mutate.ts';

	let { open = $bindable(false), workOrder }: { open: boolean; workOrder: WorkOrder } = $props();
	let candidates = $state<WorkOrder[] | null>(null);
	let selected = $state<string | null>(null);

	$effect(() => {
		if (!open || !workOrder.device) return;
		candidates = null;
		findDraftQuotesInBuilding(workOrder.device.building.id).then((found) => (candidates = found.filter((wo) => wo.id !== workOrder.id)));
	});

	const quotes = $derived(Map.groupBy(candidates ?? [], (wo) => wo.sfQuoteId!));

	async function attach() {
		if (!selected) return;
		if (await mutate(() => pushQuoteToSalesforce([workOrder.id], selected!), 'Work order added to the quote')) open = false;
	}
</script>

<Dialog bind:open title="Link to existing quote - {workOrder.workOrderNumber}">
	<p>Select the quote this work order will be bundled with</p>
	{#if candidates === null}
		<p class="grey">Loading…</p>
	{:else if quotes.size === 0}
		<p class="grey">No quote to link with</p>
	{:else}
		{#each [...quotes] as [sfQuoteId, bundled] (sfQuoteId)}
			<label class="option">
				<input type="radio" name="quote" value={sfQuoteId} bind:group={selected} />
				<div>
					<a href={bundled[0].sfQuoteLink} target="_blank" rel="noopener noreferrer">{bundled[0].quoteNumber ?? sfQuoteId}</a>
					{#each bundled as wo (wo.id)}
						<div class="grey">Bundled work order {wo.workOrderNumber} • {wo.title} • {wo.device?.deviceNo}</div>
					{/each}
				</div>
			</label>
		{/each}
	{/if}
	{#snippet actions()}
		<button onclick={() => (open = false)}>Cancel</button>
		<button class="primary" disabled={!selected} onclick={attach}>Confirm</button>
	{/snippet}
</Dialog>

<style>
	.option {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		padding: 8px 0;
		border-bottom: 1px solid #eceef3;
	}
</style>
