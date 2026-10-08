<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from '../ui/Icon.svelte';

	let { title, icon, iconClass, count, subtitle, actions, children }: { title: string; icon: IconName; iconClass: string; count: number; subtitle?: string; actions?: Snippet; children: Snippet } = $props();
</script>

<article class="slds-card slds-card_boundary related">
	<div class="slds-card__header slds-grid">
		<header class="slds-media slds-media_center slds-has-flexi-truncate">
			<div class="slds-media__figure">
				<span class="slds-icon_container {iconClass}"><Icon name={icon} cls="slds-icon slds-icon_small" /></span>
			</div>
			<div class="slds-media__body">
				<h2 class="slds-card__header-title"><span class="slds-truncate">{title} ({count})</span></h2>
				{#if subtitle}<p class="slds-text-body_small slds-text-color_weak">{subtitle}</p>{/if}
			</div>
		</header>
		{#if actions}<div class="slds-no-flex">{@render actions()}</div>{/if}
	</div>
	<div class="slds-card__body">{@render children()}</div>
	{#if count}<footer class="slds-card__footer"><a class="slds-card__footer-action" href={'#'} onclick={(e) => e.preventDefault()}>View All</a></footer>{/if}
</article>

<style>
	.related {
		margin-bottom: 12px;
	}
</style>
