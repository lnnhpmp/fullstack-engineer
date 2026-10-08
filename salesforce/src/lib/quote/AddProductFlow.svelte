<script lang="ts">
	// The org's "Add Product" screen flow, screen for screen.
	import { decimal } from '../format.ts';
	import Modal from '../ui/Modal.svelte';
	import Field from './Field.svelte';
	import { act } from './act.ts';

	type Result = { entryId: string; name: string; description: string | null; salesPrice: number };

	let { quoteId, currency, onclose }: { quoteId: string; currency: string; onclose: () => void } = $props();

	let screen = $state<'search' | 'product'>('search');
	let term = $state('');
	let results = $state<Result[]>([]);
	let picked = $state<Result | null>(null);
	let error = $state('');
	const line = $state({ name: '', description: '', pdfName: '', pdfDescription: '', unitPrice: null as number | null, cost: null as number | null, quantity: 1, discount: null as number | null });

	let timer: ReturnType<typeof setTimeout>;
	function search() {
		clearTimeout(timer);
		timer = setTimeout(async () => {
			results = await fetch(`/lightning/r/Quote/${quoteId}/products?q=${encodeURIComponent(term)}`).then((r) => r.json());
			if (picked && !results.some((r) => r.entryId === picked!.entryId)) picked = null;
		}, 300);
	}

	function next() {
		error = '';
		if (picked) line.unitPrice = picked.salesPrice;
		screen = 'product';
	}

	async function finish() {
		const outcome = await act('addProduct', { entryId: picked?.entryId, ...line }, true);
		if (outcome === true) onclose();
		else error = outcome;
	}
</script>

<Modal title="Add product to the quote" {onclose}>
	{#if screen === 'search'}
		<div class="slds-form-element slds-m-bottom_small">
			<label class="slds-form-element__label" for="flow-search">Search for an existing product</label>
			<div class="slds-form-element__control">
				<input id="flow-search" class="slds-input" placeholder="Type a product name..." bind:value={term} oninput={search} />
			</div>
		</div>
		<p>If the product you are looking for does not exist, you can directly click on "next".</p>
		{#if results.length}
			<table class="slds-table slds-table_bordered slds-table_cell-buffer slds-m-top_small">
				<thead>
					<tr class="slds-line-height_reset"><th class="col-radio"></th><th>Product Name</th><th>Product Description</th><th class="slds-text-align_right">Sales Price</th></tr>
				</thead>
				<tbody>
					{#each results as result (result.entryId)}
						<tr class:slds-is-selected={picked?.entryId === result.entryId}>
							<td><input type="radio" name="product" checked={picked?.entryId === result.entryId} onchange={() => (picked = result)} /></td>
							<td class="slds-truncate">{result.name}</td>
							<td class="slds-truncate">{result.description ?? ''}</td>
							<td class="slds-text-align_right">{decimal(result.salesPrice)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<div class="slds-border_top slds-m-top_medium slds-p-top_small slds-text-align_right">
			<button class="slds-button slds-button_brand" onclick={next}>Next</button>
		</div>
	{:else}
		{#if error}<p class="flow-error">{error}</p>{/if}
		{#if picked}
			<div class="slds-grid slds-gutters slds-m-bottom_small">
				<div class="slds-col"><p><strong>Original Product Name :</strong></p><p>{picked.name}</p></div>
				<div class="slds-col"><Field label="Different Product Name to display in the Quote PDF =>" bind:value={line.pdfName} /></div>
			</div>
			<div class="slds-grid slds-gutters slds-m-bottom_small">
				<div class="slds-col"><p><strong>Original Product Description :</strong></p><p>{picked.description ?? ''}</p></div>
				<div class="slds-col"><Field label="Different Product Description to display in the Quote PDF =>" type="textarea" bind:value={line.pdfDescription} /></div>
			</div>
			<p class="slds-m-bottom_small"><strong>List price :</strong></p>
			<p class="slds-m-bottom_small">{picked.salesPrice} {currency}</p>
		{:else}
			<Field label="Product Name" required bind:value={line.name} />
			<Field label="Product Description" type="textarea" bind:value={line.description} />
		{/if}
		<Field label="Sales Price" type="number" required bind:value={line.unitPrice} />
		<Field label="Cost" type="number" bind:value={line.cost} />
		<Field label="Quantity" type="number" required bind:value={line.quantity} />
		<Field label="Discount (%)" type="number" bind:value={line.discount} />
		<div class="slds-border_top slds-m-top_medium slds-p-top_small slds-grid slds-grid_align-spread">
			<button class="slds-button slds-button_neutral" onclick={() => (screen = 'search')}>Previous</button>
			<button class="slds-button slds-button_brand" onclick={finish}>Next</button>
		</div>
	{/if}
	{#snippet footer()}
		<div class="slds-text-align_left"><button class="slds-button slds-button_neutral" onclick={onclose}>Cancel</button></div>
	{/snippet}
</Modal>

<style>
	.col-radio {
		width: 2.5rem;
	}
	.flow-error {
		color: rgb(255, 0, 0);
		font-weight: 700;
		margin-bottom: 12px;
	}
</style>
