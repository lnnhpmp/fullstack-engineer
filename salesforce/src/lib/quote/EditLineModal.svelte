<script lang="ts">
	import Modal from '../ui/Modal.svelte';
	import Field from './Field.svelte';
	import { act } from './act.ts';

	let { line, onclose }: { line: Record<string, any>; onclose: () => void } = $props();
	// svelte-ignore state_referenced_locally
	const values = $state({
		quantity: line.Quantity,
		unitPrice: line.UnitPrice,
		cost: line.Cost__c,
		discount: line.Discount,
		pdfName: line.QuotePdf_ProductName__c ?? '',
		pdfDescription: line.Quote_Line_Description__c ?? ''
	});

	async function save() {
		if ((await act('updateLine', { lineId: line.Id, lineName: line.Product2.Name, ...values })) === true) onclose();
	}
</script>

<Modal title="Edit {line.Product2.Name}" {onclose}>
	<h3 class="slds-section__title slds-theme_shade slds-p-horizontal_small slds-m-bottom_small">Information</h3>
	<div class="slds-grid slds-gutters slds-wrap">
		<div class="slds-col slds-size_1-of-2"><Field label="Product" value={line.Product2.Name} disabled /></div>
		<div class="slds-col slds-size_1-of-2"><Field label="Quantity" type="number" required bind:value={values.quantity} /></div>
		<div class="slds-col slds-size_1-of-2"><Field label="Sales Price" type="number" required bind:value={values.unitPrice} /></div>
		<div class="slds-col slds-size_1-of-2"><Field label="Cost" type="number" bind:value={values.cost} /></div>
		<div class="slds-col slds-size_1-of-2"><Field label="Discount" type="number" bind:value={values.discount} /></div>
		<div class="slds-col slds-size_1-of-2">
			<Field label="Quote Pdf Product Name" bind:value={values.pdfName} help="Overrides the original product name in PDF" />
		</div>
		<div class="slds-col slds-size_1-of-1">
			<Field label="Quote Line Description" type="textarea" bind:value={values.pdfDescription} help="Overrides the original product description in PDF" />
		</div>
	</div>
	{#snippet footer()}
		<button class="slds-button slds-button_neutral" onclick={onclose}>Cancel</button>
		<button class="slds-button slds-button_brand" onclick={save}>Save</button>
	{/snippet}
</Modal>
