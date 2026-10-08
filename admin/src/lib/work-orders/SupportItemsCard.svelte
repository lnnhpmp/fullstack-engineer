<script lang="ts">
	import type { WorkOrder } from '../types.ts';

	let { workOrder }: { workOrder: WorkOrder } = $props();
	const items = $derived(workOrder.items.filter((i) => i.type === 'TECH_SUPPORT'));
</script>

{#if items.length}
	<div class="card">
		<header><h1>Tech support</h1></header>
		<div class="body">
			{#each items as item (item.id)}<p>{item.comment}</p>{/each}
		</div>
	</div>
{/if}
