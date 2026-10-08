<script lang="ts">
	import HeaderCard from '#lib/work-orders/HeaderCard.svelte';
	import ItemsCard from '#lib/work-orders/ItemsCard.svelte';
	import QuoteCard from '#lib/work-orders/QuoteCard.svelte';
	import SupportItemsCard from '#lib/work-orders/SupportItemsCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<a href="/work-orders/ongoing">‹ Work orders</a>
<HeaderCard workOrder={data.workOrder} />
<div class="column">
	<QuoteCard workOrder={data.workOrder} />
	<ItemsCard workOrder={data.workOrder} />
	<SupportItemsCard workOrder={data.workOrder} />
</div>

<style>
	a {
		display: inline-block;
		margin-bottom: 12px;
	}
	.column {
		max-width: 680px;
	}
</style>
