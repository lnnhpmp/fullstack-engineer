<script lang="ts">
	import Icon from '../ui/Icon.svelte';

	let { items }: { items: { label: string; onselect: () => void }[] } = $props();
	let open = $state(false);
	// Fixed position so the menu is not clipped by a scrolling table, as Lightning renders it.
	let position = $state('');

	/** Renders the menu at the end of <body>, out of any scrolling or transformed container. */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}
</script>

<svelte:window onclick={() => (open = false)} />

<div class="slds-dropdown-trigger slds-dropdown-trigger_click" class:slds-is-open={open}>
	<button
		class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small"
		aria-haspopup="true"
		title="Show Actions"
		onclick={(e) => {
			e.stopPropagation();
			const rect = e.currentTarget.getBoundingClientRect();
			position = `position: fixed; top: ${rect.bottom + 2}px; left: auto; right: ${window.innerWidth - rect.right}px;`;
			open = !open;
		}}
	>
		<Icon name="down" cls="slds-button__icon slds-button__icon_hint slds-button__icon_small" />
		<span class="slds-assistive-text">Show Actions</span>
	</button>
</div>

{#if open}
	<div class="slds-dropdown slds-dropdown_right slds-dropdown_actions menu" style={position} use:portal>
		<ul class="slds-dropdown__list" role="menu">
			{#each items as item (item.label)}
				<li class="slds-dropdown__item" role="presentation">
					<a
						href={'#'}
						role="menuitem"
						onclick={(e) => {
							e.preventDefault();
							open = false;
							item.onselect();
						}}><span class="slds-truncate">{item.label}</span></a
					>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.menu {
		display: block;
		visibility: visible;
		opacity: 1;
		transform: none;
		margin: 0;
		z-index: 9000;
	}
</style>
