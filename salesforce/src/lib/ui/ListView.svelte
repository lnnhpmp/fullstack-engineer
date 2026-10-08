<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	let { object, icon, iconClass, count, head, children }: { object: string; icon: IconName; iconClass: string; count: number; head: Snippet; children: Snippet } = $props();
</script>

<div class="slds-page-header slds-page-header_object-home">
	<div class="slds-page-header__row">
		<div class="slds-page-header__col-title">
			<div class="slds-media">
				<div class="slds-media__figure">
					<span class="slds-icon_container {iconClass}"><Icon name={icon} cls="slds-icon slds-page-header__icon" /></span>
				</div>
				<div class="slds-media__body">
					<div class="slds-page-header__name">
						<div class="slds-page-header__name-title">
							<h1>
								<span>{object}</span>
								<span class="slds-page-header__title slds-truncate">All {object}</span>
							</h1>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="slds-page-header__row">
		<div class="slds-page-header__col-meta"><p class="slds-page-header__meta-text">{count > 50 ? "50+" : count} items • Sorted by Created Date • Updated a few seconds ago</p></div>
	</div>
</div>
<div class="slds-card list">
	<table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_fixed-layout">
		<thead><tr class="slds-line-height_reset">{@render head()}</tr></thead>
		<tbody>{@render children()}</tbody>
	</table>
</div>

<style>
	.list {
		margin-top: 0;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
</style>
