<script lang="ts">
	import Icon from './Icon.svelte';
	import { toast } from './toast.svelte.ts';
</script>

{#if toast.message}
	<div class="slds-notify_container">
		<div class="slds-notify slds-notify_toast slds-theme_{toast.variant}" role="status">
			<span class="slds-icon_container slds-m-right_small slds-no-flex slds-align-top">
				<Icon name={toast.variant === 'error' ? 'error' : toast.variant === 'info' ? 'info' : 'success'} cls="slds-icon slds-icon_small" />
			</span>
			<div class="slds-notify__content"><h2 class="slds-text-heading_small">{toast.message}</h2></div>
			<div class="slds-notify__close">
				<button class="slds-button slds-button_icon slds-button_icon-inverse" title="Close" onclick={() => (toast.message = '')}>
					<Icon name="close" cls="slds-button__icon slds-button__icon_large" />
				</button>
			</div>
		</div>
	</div>
{/if}
