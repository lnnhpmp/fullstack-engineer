<script lang="ts">
	import { money } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const q = $derived(data.quote);
	const subtotal = $derived(data.lines.reduce((sum, l) => sum + l.UnitPrice * l.Quantity, 0));
	const total = $derived(q.GrandTotal);
	const vat = $derived((q.TVA__c / 100) * total);
</script>

<svelte:head><title>{q.Name}</title></svelte:head>

<article>
	<header>
		<strong>WeMaintain</strong>
		<div>
			<h1>Quote {q.QuoteNumber}</h1>
			<div>{q.Account?.Name}</div>
			<div>{(q.SentDate__c ?? q.CreatedDate).slice(0, 10)}</div>
		</div>
	</header>
	{#if q.Description__c}<p>{q.Description__c}</p>{/if}
	<table>
		<thead>
			<tr><th>Products &amp; Services</th><th class="num">Quantity</th><th class="num">Unit price</th><th class="num">Total</th></tr>
		</thead>
		<tbody>
			{#each data.lines as line (line.Id)}
				<tr>
					<!-- The per-line override wins over the catalogue product's name. -->
					<td>
						{line.QuotePdf_ProductName__c || line.Product2.Name}
						{#if line.Quote_Line_Description__c}<div class="desc">{line.Quote_Line_Description__c}</div>{/if}
						{#if line.Discount}<div class="desc">Discount {line.Discount}%</div>{/if}
					</td>
					<td class="num">{Math.round(line.Quantity)}</td>
					<td class="num">{money(line.UnitPrice, q.CurrencyIsoCode)}</td>
					<td class="num">{money(line.UnitPrice * line.Quantity * (1 - (line.Discount ?? 0) / 100), q.CurrencyIsoCode)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<table class="totals">
		<tbody>
			<tr><td>Subtotal</td><td class="num">{money(subtotal, q.CurrencyIsoCode)}</td></tr>
			{#if total < subtotal}
				<tr><td>Discount</td><td class="num">{money(total - subtotal, q.CurrencyIsoCode)}</td></tr>
				<tr><td>Discounted subtotal</td><td class="num">{money(total, q.CurrencyIsoCode)}</td></tr>
			{/if}
			<tr><td>VAT {q.TVA__c}%</td><td class="num">{money(vat, q.CurrencyIsoCode)}</td></tr>
			<tr><th>Total</th><th class="num">{money(total + vat, q.CurrencyIsoCode)}</th></tr>
		</tbody>
	</table>
</article>

<style>
	:global(body) {
		margin: 0;
		background: #888;
		font-family: Helvetica, Arial, sans-serif;
	}
	article {
		background: white;
		width: 210mm;
		min-height: 297mm;
		margin: 16px auto;
		padding: 18mm;
		box-sizing: border-box;
	}
	header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 24px;
	}
	h1 {
		margin: 0 0 4px;
		font-size: 20px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 16px;
	}
	th,
	td {
		padding: 6px;
		border-bottom: 1px solid #ccc;
		text-align: left;
	}
	.num {
		text-align: right;
	}
	.desc {
		font-size: 12px;
		color: #555;
	}
	.totals {
		width: 50%;
		margin-left: auto;
	}
</style>
