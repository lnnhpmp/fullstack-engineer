<script lang="ts">
	import Modal from '../ui/Modal.svelte';
	import { act } from './act.ts';

	let { line, onclose }: { line: Record<string, any>; onclose: () => void } = $props();

	async function remove() {
		if ((await act('deleteLine', { lineId: line.Id, lineName: line.Product2.Name })) === true) onclose();
	}
</script>

<Modal title="Delete Quote Line Item" size="small" {onclose}>
	<p class="slds-text-align_center">Are you sure you want to delete this quote line item?</p>
	{#snippet footer()}
		<button class="slds-button slds-button_neutral" onclick={onclose}>Cancel</button>
		<button class="slds-button slds-button_brand" onclick={remove}>Delete</button>
	{/snippet}
</Modal>
