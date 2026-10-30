<script lang="ts">
	import { currencyOf, money } from '../format.ts';
	import { isEditable } from '../labels.ts';
	import type { Item, WorkOrder } from '../types.ts';
	import AddExternalPartDialog from './AddExternalPartDialog.svelte';
	import ItemRow from './ItemRow.svelte';
	import PartPickerDialog from './PartPickerDialog.svelte';
	import PriceDialog from './PriceDialog.svelte';
	import PriceListPickerDialog from './PriceListPickerDialog.svelte';
	import { addItem, assignCataloguePart, removeItem, updateItem } from './api.ts';
	import { mutate } from './mutate.ts';

	let { workOrder }: { workOrder: WorkOrder } = $props();

	const QUOTED = ['PART', 'EXTERNAL_PART', 'MAN_HOUR', 'INSTALLATION'];
	// Labour first.
	const items = $derived(workOrder.items.filter((i) => QUOTED.includes(i.type)).toSorted((a, b) => Number(b.type === 'MAN_HOUR') - Number(a.type === 'MAN_HOUR')));
	const currency = $derived(currencyOf(workOrder.device?.building.countryCode));
	const editable = $derived(isEditable(workOrder.state));
	const totalCost = $derived(items.reduce((sum, i) => sum + (i.price ?? 0) * (i.type === 'INSTALLATION' ? 1 : (i.quantity ?? 0)), 0));

	let pricing = $state<Item | null>(null);
	let picking = $state<Item | null>(null);
	let addingPart = $state(false);
	let addingExternal = $state(false);
	let identifying = $state<Item | null>(null);
	let onList = $state<Record<string, string>>({});

	const timers = new Map<string, ReturnType<typeof setTimeout>>();
	function changeQuantity(item: Item, quantity: number) {
		clearTimeout(timers.get(item.id));
		timers.set(item.id, setTimeout(() => mutate(() => updateItem({ workOrderId: workOrder.id, itemId: item.id, quantity })), 500));
	}
	function pickFromList(item: Item, price: number) {
		onList = { ...onList, [item.id]: 'list' };
		mutate(() => updateItem({ workOrderId: workOrder.id, itemId: item.id, price }));
	}
</script>

<div class="card">
	<header>
		<h1>Items</h1>
		{#if items.length}<div>Total cost: <strong>{money(totalCost, currency)}</strong></div>{/if}
	</header>
	<div class="body">
		{#if workOrder.sfQuoteId && editable}
			<div class="alert">The quote has already been generated; any changes will not be reflected in the Salesforce quote.</div>
		{/if}
		{#each items as item (item.id)}
			<ItemRow
				{item}
				{currency}
				{editable}
				priceEditable={workOrder.isChargeable}
				onlist={onList[item.id] ?? null}
				onquantity={(quantity) => changeQuantity(item, quantity)}
				oneditprice={() => (pricing = item)}
				onpickprice={() => (picking = item)}
				onassignpart={() => (identifying = item)}
				onremove={() => mutate(() => removeItem(workOrder.id, item.id))}
			/>
		{:else}
			<p class="grey">No items yet</p>
		{/each}
	</div>
	{#if editable}
		<footer>
			<button onclick={() => (addingPart = true)}>+ Add part</button>
			<button onclick={() => (addingExternal = true)}>+ Add external part</button>
			{#if !workOrder.items.some((i) => i.type === 'MAN_HOUR')}
				<button onclick={() => mutate(() => addItem({ workOrderId: workOrder.id, type: 'MAN_HOUR', quantity: 1 }))}>+ Add labour</button>
			{/if}
		</footer>
	{/if}
</div>

<PriceDialog item={pricing} {currency} workOrderId={workOrder.id} onclose={() => (pricing = null)} />
<PriceListPickerDialog
	item={picking}
	{currency}
	countryCode={workOrder.device?.building.countryCode}
	onpick={(price) => {
		if (picking) pickFromList(picking, price);
	}}
	onclose={() => (picking = null)}
/>
<PartPickerDialog
	bind:open={addingPart}
	title="Add part"
	onpick={(part) => mutate(() => addItem({ workOrderId: workOrder.id, type: 'PART', partId: part.id, quantity: 1 }), 'Part added')}
/>
<PartPickerDialog
	bind:open={() => identifying !== null, (open) => !open && (identifying = null)}
	title="Assign catalogue part - {identifying?.description ?? ''}"
	onpick={(part) => mutate(() => assignCataloguePart(workOrder.id, identifying!.id, part.id), 'Catalogue part assigned')}
/>
<AddExternalPartDialog bind:open={addingExternal} workOrderId={workOrder.id} {currency} />
