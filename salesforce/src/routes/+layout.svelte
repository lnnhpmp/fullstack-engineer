<script lang="ts">
	import '@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css';
	import { page } from '$app/state';
	import Icon from '#lib/ui/Icon.svelte';
	import Toast from '#lib/ui/Toast.svelte';
	import { showToast } from '#lib/ui/toast.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const isPdf = $derived(page.url.pathname.startsWith('/apex/'));
	const NAV = ['Home', 'Accounts', 'Contacts', 'Opportunities', 'Contracts', 'Reports', 'Dashboards'];
	const objectNav = [
		{ label: 'Quotes', href: '/lightning/o/Quote/list', match: '/Quote/' },
		{ label: 'Products', href: '/lightning/o/Product2/list', match: '/Product2/' }
	];
</script>

<svelte:head><title>Salesforce (toy)</title></svelte:head>

{#if isPdf}
	{@render children()}
{:else}
	<div class="org">
		<header class="global-header">
			<div class="brand">WeMaintain <span class="toy">toy org</span></div>
			<div class="search">
				<Icon name="search" cls="slds-icon slds-icon_x-small slds-icon-text-default" />
				<input placeholder="Search..." disabled />
			</div>
			<div></div>
		</header>
		<div class="slds-context-bar">
			<div class="slds-context-bar__primary">
				<div class="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-no-hover">
					<div class="slds-context-bar__icon-action">
						<span class="slds-icon-waffle_container"><Icon name="apps" cls="slds-icon slds-icon_small slds-icon-text-default" /></span>
					</div>
					<span class="slds-context-bar__label-action slds-context-bar__app-name"><span class="slds-truncate">Sales</span></span>
				</div>
			</div>
			<nav class="slds-context-bar__secondary">
				<ul class="slds-grid">
					{#each NAV as label (label)}
						<li class="slds-context-bar__item">
							<button class="slds-context-bar__label-action nav-button" onclick={() => showToast(`${label} is not part of the toy org.`, 'info')}>
								<span class="slds-truncate">{label}</span>
							</button>
						</li>
					{/each}
					{#each objectNav as item (item.label)}
						<li class="slds-context-bar__item" class:slds-is-active={page.url.pathname.includes(item.match)}>
							<a href={item.href} class="slds-context-bar__label-action"><span class="slds-truncate">{item.label}</span></a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
		<main>{@render children()}</main>
	</div>
	<Toast />
{/if}

<style>
	:global(body) {
		background: #f3f3f3;
	}
	.org {
		min-height: 100vh;
		background: #b0c4df linear-gradient(#cfdcee, #f3f3f3 320px);
	}
	.global-header {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		align-items: center;
		background: #0e1b3d;
		color: white;
		height: 50px;
		padding: 0 16px;
	}
	.brand {
		font-weight: 700;
		font-size: 18px;
	}
	.toy {
		font-weight: 400;
		font-size: 12px;
		opacity: 0.6;
		margin-left: 6px;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		background: white;
		border-radius: 4px;
		padding: 4px 10px;
		max-width: 420px;
		width: 100%;
		justify-self: center;
	}
	.search input {
		border: none;
		background: none;
		flex: 1;
	}
	.nav-button {
		background: none;
		border: none;
		cursor: pointer;
	}
	main {
		padding: 12px;
	}
</style>
