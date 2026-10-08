<script lang="ts">
	import { STATE } from '../labels.ts';
	import type { WorkOrder } from '../types.ts';
	import Pill from '../ui/Pill.svelte';

	let { workOrder }: { workOrder: WorkOrder } = $props();
	const device = $derived(workOrder.device);
</script>

<div class="card bar">
	<div>
		<div class="number">{workOrder.workOrderNumber}</div>
		<div class="pills">
			<Pill>{workOrder.workOrderType}</Pill>
			<Pill theme={STATE[workOrder.state][1]}>{STATE[workOrder.state][0]}</Pill>
		</div>
		<h1>{workOrder.title ?? workOrder.description}</h1>
	</div>
	{#if device}
		<dl>
			<dt>Unit</dt><dd>{device.deviceNo}</dd>
			<dt>Building</dt><dd>{device.building.name}, {device.building.city}</dd>
			<dt>Client</dt><dd>{device.building.customer.companyName}</dd>
			<dt>Contract</dt>
			<dd>{#each device.contracts as { contract } (contract.contractNo)}{contract.contractNo} ({contract.type}){/each}</dd>
		</dl>
	{/if}
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		gap: 24px;
		padding: 16px 20px;
	}
	.number {
		font-weight: 700;
		color: #6b7286;
	}
	.pills {
		display: flex;
		gap: 6px;
		margin: 6px 0;
	}
	h1 {
		font-size: 18px;
		margin: 4px 0 0;
	}
	dl {
		display: grid;
		grid-template-columns: auto auto;
		gap: 4px 16px;
		margin: 0;
	}
	dt {
		color: #6b7286;
	}
	dd {
		margin: 0;
	}
</style>
