<script lang="ts">
	import '../app.css';
	import { snackbar } from '#lib/snackbar.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head><title>WeMaintain admin (toy)</title></svelte:head>

<div class="shell">
	<aside>
		<div class="logo">WeMaintain <small>admin</small></div>
		<nav><a href="/work-orders/ongoing">Work orders</a></nav>
	</aside>
	<main>{@render children()}</main>
</div>

{#if snackbar.message}
	<div class="snackbar" class:error={snackbar.error}>{snackbar.message}</div>
{/if}

<style>
	.shell {
		display: flex;
		min-height: 100vh;
	}
	aside {
		width: 200px;
		background: #121a33;
		color: white;
		padding: 20px 16px;
		flex-shrink: 0;
	}
	.logo {
		font-weight: 700;
		margin-bottom: 24px;
	}
	.logo small {
		font-weight: 400;
		opacity: 0.6;
	}
	aside a {
		color: white;
	}
	main {
		flex: 1;
		padding: 24px 32px;
		min-width: 0;
	}
	.snackbar {
		position: fixed;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		background: #1b2133;
		color: white;
		padding: 10px 16px;
		border-radius: 6px;
		max-width: 640px;
		white-space: pre-wrap;
	}
	.snackbar.error {
		background: #b42318;
	}
</style>
