<script lang="ts">
	import type { Part } from '../types.ts';
	import Dialog from '../ui/Dialog.svelte';
	import { findParts } from './api.ts';

	let {
		open = $bindable(false),
		title,
		onpick
	}: { open: boolean; title: string; onpick: (part: Part) => Promise<boolean> } = $props();
	let search = $state('');
	let parts = $state<Part[]>([]);

	$effect(() => {
		if (open) findParts(search).then((found) => (parts = found));
	});

	async function pick(part: Part) {
		if (await onpick(part)) open = false;
	}
</script>

<Dialog bind:open {title}>
	<input class="search" placeholder="Search by SKU or name" bind:value={search} />
	<ul>
		{#each parts as part (part.id)}
			<li><button class="link" onclick={() => pick(part)}>{part.sku}</button> {part.name} <span class="grey">{part.brand ?? ''}</span></li>
		{:else}
			<li class="grey">No parts</li>
		{/each}
	</ul>
	{#snippet actions()}<button onclick={() => (open = false)}>Close</button>{/snippet}
</Dialog>

<style>
	.search {
		width: 100%;
		box-sizing: border-box;
	}
	ul {
		list-style: none;
		padding: 0;
		max-height: 320px;
		overflow: auto;
	}
	li {
		padding: 4px 0;
	}
</style>
