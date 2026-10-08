<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Theme } from '../labels.ts';

	let { theme = 'neutral', children }: { theme?: Theme; children: Snippet } = $props();
</script>

<span class="pill {theme}">{@render children()}</span>

<style>
	.pill {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
	}
	.neutral {
		background: #eef0f4;
		color: #3a4256;
	}
	.success {
		background: #e3f6ec;
		color: #1d7a46;
	}
	.warning {
		background: #fff3dc;
		color: #9a5b00;
	}
	.danger {
		background: #fde8e8;
		color: #b42318;
	}
</style>
