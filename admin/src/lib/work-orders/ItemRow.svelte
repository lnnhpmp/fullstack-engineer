<script lang="ts">
	import { money } from '../format.ts';
	import type { Item } from '../types.ts';
	import Pill from '../ui/Pill.svelte';

	let {
		item,
		currency,
		editable,
		priceEditable,
		onlist,
		onquantity,
		oneditprice,
		onpickprice,
		onassignpart,
		onremove
	}: {
		item: Item;
		currency: string;
		editable: boolean;
		priceEditable: boolean;
		onlist: string | null;
		onquantity: (quantity: number) => void;
		oneditprice: () => void;
		onpickprice: () => void;
		onassignpart: () => void;
		onremove: () => void;
	} = $props();

	const awaitingSupply = $derived(item.type === 'EXTERNAL_PART' && !item.partId);
	const hasQuantity = $derived(item.type !== 'INSTALLATION');
	const quantity = $derived(hasQuantity ? (item.quantity ?? 0) : 1);
	const label = $derived(
		item.type === 'PART' ? item.part?.name : item.type === 'EXTERNAL_PART' ? item.description : item.type === 'MAN_HOUR' ? 'Labour (hours)' : 'Installation'
	);
</script>

<div class="item">
	<div class="main">
		<div class="pills">
			{#if item.type === 'PART'}<Pill>SKU {item.part?.sku}</Pill>{/if}
			{#if item.type === 'EXTERNAL_PART'}
				{#if awaitingSupply}<Pill theme="warning">Awaiting supply team</Pill>{:else}<Pill>SKU {item.part?.sku}</Pill>{/if}
			{/if}
			{#if item.type === 'MAN_HOUR'}<Pill>Labour</Pill>{/if}
			{#if item.type === 'INSTALLATION'}<Pill>Installation</Pill>{/if}
			{#if onlist}<Pill theme="success">On list</Pill>{/if}
		</div>
		<div class="label">{label}</div>
		{#if item.type === 'EXTERNAL_PART' && item.part}<div class="grey">{item.part.name}</div>{/if}
		{#if item.part?.brand}<div class="grey">{item.part.brand}</div>{/if}
	</div>

	<div class="price">
		<div class="grey">{quantity} x {money(item.price, currency)}</div>
		<div class="total">{item.price == null ? '--' : money(item.price * quantity, currency)}</div>
		{#if item.type === 'INSTALLATION'}<div class="grey">Sell price: {money(item.sellPrice, currency)}</div>{/if}
	</div>

	{#if editable}
		<div class="actions">
			{#if hasQuantity}
				<div class="stepper">
					<button onclick={() => onquantity(Math.max(0, quantity - 1))}>−</button>
					<input type="number" min="0" max="999" value={quantity} onchange={(e) => onquantity(Number(e.currentTarget.value))} />
					<button onclick={() => onquantity(Math.min(999, quantity + 1))}>+</button>
				</div>
			{/if}
			<button class="link" disabled={!priceEditable} onclick={oneditprice}>Edit price</button>
			{#if item.type !== 'INSTALLATION'}
				<button class="link" disabled={!priceEditable} onclick={onpickprice}>Pick from price list</button>
			{/if}
			{#if awaitingSupply}<button class="link" onclick={onassignpart}>Assign catalogue part</button>{/if}
			<button class="link danger" onclick={onremove}>Delete</button>
		</div>
	{/if}
</div>

<style>
	.item {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 8px 16px;
		padding: 14px 0;
		border-bottom: 1px solid #eceef3;
	}
	.pills {
		display: flex;
		gap: 6px;
		margin-bottom: 4px;
	}
	.label {
		font-weight: 500;
	}
	.price {
		text-align: right;
	}
	.total {
		font-weight: 600;
	}
	.actions {
		grid-column: 1 / -1;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.stepper {
		display: flex;
		align-items: center;
	}
	.stepper button {
		padding: 4px 10px;
	}
	.stepper input {
		width: 56px;
		text-align: center;
		margin: 0 4px;
	}
	.danger {
		color: #b42318;
	}
</style>
