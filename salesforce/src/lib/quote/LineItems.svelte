<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { decimal, money, percent } from '../format.ts';
	import Icon from '../ui/Icon.svelte';
	import AddProductFlow from './AddProductFlow.svelte';
	import DeleteLineModal from './DeleteLineModal.svelte';
	import EditAllModal from './EditAllModal.svelte';
	import EditLineModal from './EditLineModal.svelte';
	import RelatedCard from './RelatedCard.svelte';
	import RowMenu from './RowMenu.svelte';
	import { notInToy } from './act.ts';

	let { quoteId, lines, currency }: { quoteId: string; lines: Record<string, any>[]; currency: string } = $props();

	let editing = $state<Record<string, any> | null>(null);
	let deleting = $state<Record<string, any> | null>(null);
	let editingAll = $state(false);
	let adding = $state(false);
	const total = (l: Record<string, any>) => l.UnitPrice * l.Quantity * (1 - (l.Discount ?? 0) / 100);
</script>

<RelatedCard
	title="Quote Line Items"
	icon="quotes"
	iconClass="slds-icon-standard-quotes"
	count={lines.length}
	subtitle="{lines.length} {lines.length === 1 ? 'item' : 'items'} • Sorted by Sort Order • Updated a few seconds ago"
>
	{#snippet actions()}
		<div class="slds-grid slds-grid_vertical-align-center">
			<button class="slds-button slds-button_icon slds-button_icon-border-filled slds-m-right_xx-small" title="List View Controls" onclick={() => notInToy('List view controls')}>
				<Icon name="settings" />
			</button>
			<button class="slds-button slds-button_icon slds-button_icon-border-filled slds-m-right_x-small" title="Refresh" onclick={() => invalidateAll()}>
				<Icon name="refresh" />
			</button>
			<div class="slds-button-group" role="group">
				<button class="slds-button slds-button_neutral" onclick={() => (editingAll = true)}>Edit Products</button>
				<button class="slds-button slds-button_neutral" onclick={() => notInToy('Sort')}>Sort</button>
			</div>
		</div>
	{/snippet}
	{#if lines.length}
		<div class="scroll">
			<table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_fixed-layout slds-no-row-hover">
				<thead>
					<tr class="slds-line-height_reset">
						<th class="col-n"></th>
						<th class="col-product">Product</th>
						<th>Cost</th>
						<th>Sales Price</th>
						<th>Quantity</th>
						<th>Discount</th>
						<th>TotalCost</th>
						<th>Total Price</th>
						<th class="col-menu"></th>
					</tr>
				</thead>
				<tbody>
					{#each lines as line, i (line.Id)}
						<tr>
							<td>{i + 1}</td>
							<td class="slds-truncate" title={line.Product2.Name}><a href="/lightning/o/Product2/list">{line.Product2.Name}</a></td>
							<td>{money(line.Cost__c, currency)}</td>
							<td>{money(line.UnitPrice, currency)}</td>
							<td>{decimal(line.Quantity)}</td>
							<td>{percent(line.Discount)}</td>
							<td>{line.Cost__c == null ? '' : money(line.Cost__c * line.Quantity, currency)}</td>
							<td>{money(total(line), currency)}</td>
							<td>
								<RowMenu
									items={[
										{ label: 'Edit', onselect: () => (editing = line) },
										{ label: 'Delete', onselect: () => (deleting = line) }
									]}
								/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</RelatedCard>

<div class="slds-text-align_center add-product">
	<button class="slds-button slds-button_neutral" onclick={() => (adding = true)}>Add Product</button>
</div>

{#if editing}<EditLineModal line={editing} onclose={() => (editing = null)} />{/if}
{#if deleting}<DeleteLineModal line={deleting} onclose={() => (deleting = null)} />{/if}
{#if editingAll}<EditAllModal {lines} onclose={() => (editingAll = false)} />{/if}
{#if adding}<AddProductFlow {quoteId} {currency} onclose={() => (adding = false)} />{/if}

<style>
	.scroll {
		overflow-x: auto;
	}
	table {
		min-width: 900px;
	}
	.col-n {
		width: 2.5rem;
	}
	.col-product {
		width: 16rem;
	}
	.col-menu {
		width: 3rem;
	}
	.add-product {
		margin: -4px 0 16px;
	}
</style>
