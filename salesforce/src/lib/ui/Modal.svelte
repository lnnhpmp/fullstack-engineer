<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { title, size = 'medium', onclose, children, footer }: { title: string; size?: 'small' | 'medium' | 'large'; onclose: () => void; children: Snippet; footer?: Snippet } = $props();
</script>

<section role="dialog" tabindex="-1" aria-modal="true" class="slds-modal slds-fade-in-open slds-modal_{size}">
	<div class="slds-modal__container">
		<button class="slds-button slds-button_icon slds-modal__close" onclick={onclose} title="Cancel and close">
			<Icon name="close" cls="slds-button__icon slds-button__icon_large" />
			<span class="slds-assistive-text">Cancel and close</span>
		</button>
		<div class="slds-modal__header"><h1 class="slds-modal__title slds-hyphenate">{title}</h1></div>
		<div class="slds-modal__content slds-p-around_medium">{@render children()}</div>
		{#if footer}<div class="slds-modal__footer">{@render footer()}</div>{/if}
	</div>
</section>
<div class="slds-backdrop slds-backdrop_open" role="presentation"></div>
