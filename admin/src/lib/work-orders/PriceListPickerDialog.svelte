<script lang="ts">
	import type { Item, PriceList, PriceListLine, PriceListLineKind, PriceListPrice } from '../types.ts';
	import Dialog from '../ui/Dialog.svelte';
	import { money } from '../format.ts';
	import { getPriceListForAccount, searchPriceListLines } from './api.ts';

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
		onpick: (pick: { price: number; lineId: string; timeBandId: string | null }) => void;
		onclose: () => void;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let priceList = $state<PriceList | null>(null);
	let loadingList = $state(false);
	let loadError = $state<string | null>(null);
	let results = $state<PriceListLine[]>([]);
	let searching = $state(false);
	let searchError = $state<string | null>(null);
	let selected = $state<PriceListLine | null>(null);
	let band = $state<PriceListPrice | null>(null);

	$effect(() => {
		open = !!item;
		if (!item) return;
		query = '';
		selected = null;
		band = null;
		results = [];
		loadError = null;
		searchError = null;
	});

	// A MAN_HOUR item is priced from a labour rate; anything else from a parts line.
	const kind = $derived<PriceListLineKind>(item?.type === 'MAN_HOUR' ? 'LABOUR_RATE' : 'LINE');

	$effect(() => {
		if (!item) return;
		const customer = customerId;
		let cancelled = false;
		priceList = null;
		loadingList = true;
		loadError = null;
		getPriceListForAccount(customer)
			.then((list) => {
				if (!cancelled) priceList = list;
			})
			.catch((error) => {
				if (!cancelled) loadError = (error as Error).message;
			})
			.finally(() => {
				if (!cancelled) loadingList = false;
			});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const list = priceList;
		const lineKind = kind;
		const term = query;
		if (!open || !list) return;

		let cancelled = false;
		selected = null;
		band = null;
		searching = true;
		searchError = null;
		const timer = setTimeout(() => {
			searchPriceListLines(list.id, term, lineKind, 20)
				.then((lines) => {
					if (!cancelled) results = lines;
				})
				.catch((error) => {
					if (!cancelled) searchError = (error as Error).message;
				})
				.finally(() => {
					if (!cancelled) searching = false;
				});
		}, 200);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	});

	const chosenPrice = $derived(selected ? (selected.prices.length === 1 ? selected.prices[0] : band) : null);
	const price = $derived(chosenPrice?.unitPrice ?? null);

	function pick(line: PriceListLine) {
		if (selected?.id === line.id) return;
		selected = line;
		band = line.prices.length > 1 ? line.prices[0] : null;
	}

	function confirm() {
		if (!selected || !chosenPrice) return;
		onpick({ price: chosenPrice.unitPrice, lineId: selected.id, timeBandId: chosenPrice.timeBand?.id ?? null });
		open = false;
	}
</script>

<Dialog bind:open title="Pick from price list">
	{#if loadingList}
		<p class="grey">Loading the account's price list…</p>
	{:else if loadError}
		<p class="error">{loadError}</p>
	{:else if !priceList}
		<p class="grey">This account has no linked price list. Price the item by hand.</p>
	{:else}
		<p class="grey note">{priceList.name} — {priceList.country}, {priceList.currency}</p>

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
						{#if line.prices.length === 1}
							<span class="line-price">{money(line.prices[0].unitPrice, currency)}</span>
						{:else}
							<span class="unit">{line.unitOfMeasure}</span>
						{/if}
					</button>
					{#if selected?.id === line.id && line.prices.length > 1}
						<div class="bands">
							{#each line.prices as linePrice (linePrice.id)}
								<button type="button" class="band" class:active={band?.id === linePrice.id} onclick={() => (band = linePrice)}>
									<span>{linePrice.timeBand?.name ?? 'Standard'}</span>
									<span>{money(linePrice.unitPrice, currency)}</span>
								</button>
							{/each}
						</div>
					{/if}
				</li>
			{:else}
				<li class="grey empty">
					{#if searching}Searching…{:else if searchError}{searchError}{:else}No match{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#snippet actions()}
		<button onclick={() => (open = false)}>Cancel</button>
		<button class="primary" disabled={price == null} onclick={confirm}>Use {price == null ? 'price' : money(price, currency)}</button>
	{/snippet}
</Dialog>

<style>
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
	.error {
		color: #b42318;
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
	}
	.bands {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 0 12px 10px;
	}
	.band {
		display: flex;
		gap: 8px;
		align-items: baseline;
		border: 1px solid #d7dbe4;
		border-radius: 6px;
		background: none;
		padding: 4px 8px;
		font: inherit;
		font-size: 12px;
	}
	.band.active {
		border-color: #2952cc;
		background: #eef4ff;
	}
</style>
