<script lang="ts" module>
	import add from '@salesforce-ux/design-system/assets/icons/utility/add.svg?raw';
	import apps from '@salesforce-ux/design-system/assets/icons/utility/apps.svg?raw';
	import check from '@salesforce-ux/design-system/assets/icons/utility/check.svg?raw';
	import chevrondown from '@salesforce-ux/design-system/assets/icons/utility/chevrondown.svg?raw';
	import chevronright from '@salesforce-ux/design-system/assets/icons/utility/chevronright.svg?raw';
	import close from '@salesforce-ux/design-system/assets/icons/utility/close.svg?raw';
	import down from '@salesforce-ux/design-system/assets/icons/utility/down.svg?raw';
	import edit from '@salesforce-ux/design-system/assets/icons/utility/edit.svg?raw';
	import error from '@salesforce-ux/design-system/assets/icons/utility/error.svg?raw';
	import info from '@salesforce-ux/design-system/assets/icons/utility/info.svg?raw';
	import refresh from '@salesforce-ux/design-system/assets/icons/utility/refresh.svg?raw';
	import search from '@salesforce-ux/design-system/assets/icons/utility/search.svg?raw';
	import settings from '@salesforce-ux/design-system/assets/icons/utility/settings.svg?raw';
	import success from '@salesforce-ux/design-system/assets/icons/utility/success.svg?raw';
	import file from '@salesforce-ux/design-system/assets/icons/standard/file.svg?raw';
	import product from '@salesforce-ux/design-system/assets/icons/standard/product.svg?raw';
	import quotes from '@salesforce-ux/design-system/assets/icons/standard/quotes.svg?raw';
	import related_list from '@salesforce-ux/design-system/assets/icons/standard/related_list.svg?raw';

	const ICONS = { add, apps, check, chevrondown, chevronright, close, down, edit, error, info, refresh, search, settings, success, file, product, quotes, related_list };
	export type IconName = keyof typeof ICONS;
</script>

<script lang="ts">
	/** An SLDS icon, inlined. `cls` goes on the <svg>, as SLDS expects. */
	let { name, cls = 'slds-button__icon' }: { name: IconName; cls?: string } = $props();
	const svg = $derived(ICONS[name].replace('<svg ', `<svg class="${cls}" aria-hidden="true" `));
</script>

{@html svg}
