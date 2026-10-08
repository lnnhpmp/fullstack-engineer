<script lang="ts">
	import { date, money } from '#lib/format.ts';
	import ListView from '#lib/ui/ListView.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ListView object="Quotes" icon="quotes" iconClass="slds-icon-standard-quotes" count={data.total}>
	{#snippet head()}<th>Quote Name</th><th>Account Name</th><th>Status</th><th>Grand Total</th><th>Created Date</th>{/snippet}
	{#each data.quotes as quote (quote.Id)}
		<tr>
			<td class="slds-truncate"><a href="/lightning/r/Quote/{quote.Id}/view">{quote.Name}</a></td>
			<td class="slds-truncate">{quote.Account?.Name}</td>
			<td>{quote.Status}</td>
			<td>{money(quote.GrandTotal, quote.CurrencyIsoCode)}</td>
			<td>{date(quote.CreatedDate)}</td>
		</tr>
	{/each}
</ListView>
