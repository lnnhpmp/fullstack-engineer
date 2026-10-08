<script lang="ts">
	import Details from '#lib/quote/Details.svelte';
	import Highlights from '#lib/quote/Highlights.svelte';
	import LineItems from '#lib/quote/LineItems.svelte';
	import RelatedCard from '#lib/quote/RelatedCard.svelte';
	import RowMenu from '#lib/quote/RowMenu.svelte';
	import StatusPath from '#lib/quote/StatusPath.svelte';
	import { notInToy } from '#lib/quote/act.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const q = $derived(data.quote);
</script>

<svelte:head><title>{q.Name} | Quote | Salesforce</title></svelte:head>

<Highlights quote={q} />
<StatusPath status={q.Status} statuses={data.statuses} />

<div class="slds-grid slds-gutters_x-small">
	<div class="slds-col slds-size_1-of-2">
		<article class="slds-card slds-p-around_small">
			<div class="slds-tabs_default">
				<ul class="slds-tabs_default__nav"><li class="slds-tabs_default__item slds-is-active"><span class="slds-tabs_default__link">Related</span></li></ul>
			</div>
			<div class="slds-p-top_small">
				<LineItems quoteId={q.Id} lines={data.lines} currency={q.CurrencyIsoCode} />
				<RelatedCard title="Repair Requests" icon="related_list" iconClass="slds-icon-standard-related-list" count={data.links.length}>
					{#if data.links.length}
						<table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_fixed-layout">
							<thead>
								<tr class="slds-line-height_reset"><th class="col-n"></th><th>RRID</th><th>See in admin</th><th class="col-menu"></th></tr>
							</thead>
							<tbody>
								{#each data.links as link, i (link.Id)}
									<tr>
										<td>{i + 1}</td>
										<td class="slds-truncate">{link.RRID__c}</td>
										<td><a href="{data.admin}/work-orders/details/{link.RRID__c}" target="_blank">See in admin</a></td>
										<td><RowMenu items={[{ label: 'Edit', onselect: () => notInToy('Editing repair requests') }]} /></td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</RelatedCard>
			</div>
		</article>
	</div>
	<div class="slds-col slds-size_1-of-2">
		<Details quote={q} lines={data.lines} />
	</div>
</div>

<style>
	.col-n {
		width: 2.5rem;
	}
	.col-menu {
		width: 3rem;
	}
</style>
