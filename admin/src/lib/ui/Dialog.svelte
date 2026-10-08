<script lang="ts">
	import type { Snippet } from 'svelte';

	let { open = $bindable(false), title, children, actions }: { open: boolean; title: string; children: Snippet; actions?: Snippet } = $props();
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog bind:this={dialog} onclose={() => (open = false)}>
	<h2>{title}</h2>
	{@render children()}
	{#if actions}<footer>{@render actions()}</footer>{/if}
</dialog>

<style>
	dialog {
		border: none;
		border-radius: 8px;
		padding: 24px;
		min-width: 420px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}
	h2 {
		margin: 0 0 16px;
		font-size: 18px;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 20px;
	}
</style>
