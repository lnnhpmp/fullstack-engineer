<script lang="ts">
	import Modal from '../ui/Modal.svelte';
	import RowMenu from './RowMenu.svelte';
	import { act } from './act.ts';

	let { lines, onclose }: { lines: Record<string, any>[]; onclose: () => void } = $props();
	// svelte-ignore state_referenced_locally
	let rows = $state(lines.map((l) => ({ Id: l.Id, name: l.Product2.Name, Cost__c: l.Cost__c, Quantity: l.Quantity, UnitPrice: l.UnitPrice, Discount: l.Discount })));
	let deleted = $state<string[]>([]);

	async function save() {
		const payload = { rows: rows.map(({ name, ...fields }) => fields), deleted };
		if ((await act('saveAll', { payload: JSON.stringify(payload) })) === true) onclose();
	}
</script>

<Modal title="Edit All Quote Line Items" size="large" {onclose}>
	<table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_fixed-layout">
		<thead>
			<tr class="slds-line-height_reset">
				<th class="col-n"></th>
				<th><abbr class="slds-required">*</abbr>Product</th>
				<th><abbr class="slds-required">*</abbr>Cost</th>
				<th><abbr class="slds-required">*</abbr>Quantity</th>
				<th><abbr class="slds-required">*</abbr>Sales Price</th>
				<th>Discount (Percentage)</th>
				<th class="col-menu"></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (row.Id)}
				<tr>
					<td>{i + 1}</td>
					<td class="slds-truncate"><a href={'#'} onclick={(e) => e.preventDefault()}>{row.name}</a></td>
					<td><input class="slds-input" type="number" step="any" bind:value={row.Cost__c} /></td>
					<td><input class="slds-input" type="number" step="any" bind:value={row.Quantity} /></td>
					<td><input class="slds-input" type="number" step="any" bind:value={row.UnitPrice} /></td>
					<td><input class="slds-input" type="number" step="any" bind:value={row.Discount} /></td>
					<td>
						<RowMenu
							items={[
								{
									label: 'Delete',
									onselect: () => {
										deleted.push(row.Id);
										rows = rows.filter((r) => r.Id !== row.Id);
									}
								}
							]}
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#snippet footer()}
		<button class="slds-button slds-button_neutral" onclick={onclose}>Cancel</button>
		<button class="slds-button slds-button_brand" onclick={save}>Save</button>
	{/snippet}
</Modal>

<style>
	.col-n {
		width: 3rem;
	}
	.col-menu {
		width: 3.5rem;
	}
</style>
