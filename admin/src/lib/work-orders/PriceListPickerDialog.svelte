<script lang="ts">
	import type { Item } from '../types.ts';
	import Dialog from '../ui/Dialog.svelte';
	import { money } from '../format.ts';
	import { priceListForCustomer, type MockBand, type MockLine } from './priceListMock.ts';

	let {
		item,
		currency,
		customerId,
		onpick,
		onclose
	}: {
		item: Item | null;
		currency: string;
		customerId: number;
		onpick: (price: number, band: string | null) => void;
		onclose: () => void;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let selected = $state<MockLine | null>(null);
	let band = $state<MockBand | null>(null);

	$effect(() => {
		open = !!item;
		if (item) {
			query = '';
			selected = null;
			band = null;
		}
	});
	$effect(() => {
		if (!open && item) onclose();
	});

	const list = $derived(priceListForCustomer(customerId));
	const kind = $derived(item?.type === 'MAN_HOUR' ? 'LABOUR_RATE' : 'LINE');
	const results = $derived(
		list
			? list.lines
					.filter((l) => l.kind === kind)
					.filter((l) => query.trim() === '' || `${l.designation} ${l.code}`.toLowerCase().includes(query.trim().toLowerCase()))
					.slice(0, 8)
			: []
	);
	const price = $derived(selected ? (selected.bands ? band?.price : selected.price) : null);

	function pick(line: MockLine) {
		if (selected?.id === line.id) return;
		selected = line;
		band = line.bands ? line.bands[0] : null;
	}

	function confirm() {
		if (!selected || price == null) return;
		onpick(price, band?.label ?? null);
		open = false;
	}
</script>

<Dialog bind:open title="Pick from price list">
	<p class="proto">Prototype — fake data. The real version queries <code>searchPriceListLines</code>.</p>

	{#if !list}
		<p class="grey">This account has no linked price list. Price the item by hand.</p>
	{:else}
		<p class="grey note">{list.client} — {list.country}, {list.currency}</p>
		<p class="grey note">{list.note}</p>

		<p class="filter-hint">Showing {kind === 'LABOUR_RATE' ? 'labour rates' : 'parts'} for this item</p>

		<label class="field">
			<span>Search</span>
			<input type="search" placeholder="Name, code…" bind:value={query} />
		</label>

		<ul>
			{#each results as line (line.id)}
				<li class:active={selected?.id === line.id}>
					<button type="button" class="row" onclick={() => pick(line)}>
						<span class="code">{line.code}</span>
						<span class="desig">{line.designation}</span>
						{#if line.kind === 'LABOUR_RATE'}<span class="tag">Labour</span>{/if}
						{#if line.bands}
							<span class="unit">{line.unit}</span>
						{:else}
							<span class="line-price">{money(line.price, currency)}</span>
						{/if}
					</button>
					{#if line.bands && selected?.id === line.id}
						<div class="bands">
							{#each line.bands as b (b.id)}
								<button type="button" class="band" class:active={band?.id === b.id} onclick={() => (band = b)}>
									<span>{b.label}</span>
									<span>{money(b.price, currency)}</span>
								</button>
							{/each}
						</div>
					{/if}
				</li>
			{:else}
				<li class="grey empty">No match</li>
			{/each}
		</ul>
	{/if}

	{#snippet actions()}
		<button onclick={() => (open = false)}>Cancel</button>
		<button class="primary" disabled={price == null} onclick={confirm}>Use {price == null ? 'price' : money(price, currency)}</button>
	{/snippet}
</Dialog>

<style>
	.proto {
		margin: 0 0 12px;
		padding: 8px 10px;
		border-radius: 6px;
		background: #eef0f4;
		color: #6b7286;
		font-size: 12px;
	}
	.field {
		display: block;
		margin-bottom: 12px;
	}
	.field span {
		display: block;
		margin-bottom: 4px;
		color: #6b7286;
	}
	.field input {
		width: 100%;
		box-sizing: border-box;
	}
	.note {
		margin: 0 0 4px;
		font-size: 12px;
	}
	.filter-hint {
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 500;
		color: #2952cc;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid #eceef3;
		border-radius: 6px;
	}
	li {
		border-bottom: 1px solid #eceef3;
	}
	li:last-child {
		border-bottom: none;
	}
	li.active {
		background: #eef4ff;
	}
	li.empty {
		padding: 10px 12px;
	}
	.row {
		display: flex;
		gap: 8px;
		align-items: baseline;
		width: 100%;
		border: none;
		background: none;
		padding: 10px 12px;
		text-align: left;
		font: inherit;
	}
	.code {
		font-weight: 600;
		color: #6b7286;
		font-size: 12px;
	}
	.tag {
		font-size: 11px;
		font-weight: 500;
		padding: 1px 6px;
		border-radius: 10px;
		background: #e3f6ec;
		color: #1d7a46;
	}
	.desig {
		flex: 1;
	}
	.unit {
		color: #6b7286;
		font-size: 12px;
	}
	.line-price {
		font-weight: 600;
		white-space: nowrap;
	}
	.bands {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 0 12px 10px;
	}
	.band {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		text-align: left;
	}
	.band.active {
		border-color: #2952cc;
		background: #eef4ff;
	}
</style>
