<script lang="ts">
	import ListView from '#lib/ui/ListView.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ListView object="Products" icon="product" iconClass="slds-icon-standard-product" count={data.total}>
	{#snippet head()}<th>Product Name</th><th>Product SKU</th><th>Product Family</th><th>Source</th><th>Price Books</th>{/snippet}
	{#each data.products as product (product.Id)}
		<tr>
			<td class="slds-truncate">{product.Name}</td>
			<td>{product.StockKeepingUnit ?? ''}</td>
			<td>{product.Family}</td>
			<td>{product.Source__c ?? ''}</td>
			<td class="slds-truncate">{product.pricebooks.map((pb: { name: string; price: number }) => `${pb.name}: ${pb.price}`).join(' · ')}</td>
		</tr>
	{/each}
</ListView>
