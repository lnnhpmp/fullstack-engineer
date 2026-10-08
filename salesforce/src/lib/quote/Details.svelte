<script lang="ts">
	import { addDays, date, dateTime, money, percent } from '../format.ts';
	import Icon from '../ui/Icon.svelte';

	let { quote, lines }: { quote: Record<string, any>; lines: Record<string, any>[] } = $props();
	const CURRENCY_NAME: Record<string, string> = { EUR: 'Euro', GBP: 'British Pound', SGD: 'Singapore Dollar' };
	let tab = $state<'details' | 'activity'>('details');
	let closed = $state<Record<string, boolean>>({});

	const subtotal = $derived(lines.reduce((sum, l) => sum + l.UnitPrice * l.Quantity, 0));
	const totalCost = $derived(lines.reduce((sum, l) => sum + (l.Cost__c ?? 0) * l.Quantity, 0));
	const discount = $derived(subtotal ? (1 - quote.GrandTotal / subtotal) * 100 : 0);
	const margin = $derived(lines.some((l) => l.Cost__c == null) || !subtotal ? null : ((subtotal - totalCost - 0.1 * subtotal) / subtotal) * 100);

	type Row = [string, string];
	const sections = $derived<[string, Row[]][]>([
		[
			'Quote Information',
			[
				['Quote Name', quote.Name],
				['Expiration Date', date(addDays(quote.CreatedDate, 30))],
				['Status', quote.Status],
				['Sent Date', date(quote.SentDate__c)],
				['Quote Currency', `${quote.CurrencyIsoCode} - ${CURRENCY_NAME[quote.CurrencyIsoCode] ?? quote.CurrencyIsoCode}`],
				['Email', quote.Email ?? '']
			]
		],
		['Description', [['Description', quote.Description__c ?? '']]],
		[
			'Totals',
			[
				['TVA', percent(quote.TVA__c)],
				['Subtotal', money(subtotal, quote.CurrencyIsoCode)],
				['Discount', percent(discount)],
				['Total Price', money(quote.GrandTotal, quote.CurrencyIsoCode)],
				['Booked Margin', percent(margin)],
				['TotalCost', money(totalCost, quote.CurrencyIsoCode)]
			]
		],
		[
			'System Information',
			[
				['Created By', `Integration User, ${dateTime(quote.CreatedDate)}`],
				['WeMaintain_Quote_ID', quote.WeMaintain_Quote_ID__c ?? '']
			]
		]
	]);
</script>

<article class="slds-card details">
	<div class="slds-tabs_default">
		<ul class="slds-tabs_default__nav" role="tablist">
			<li class="slds-tabs_default__item" class:slds-is-active={tab === 'details'} role="presentation">
				<button class="slds-tabs_default__link tab" role="tab" onclick={() => (tab = 'details')}>Details</button>
			</li>
			<li class="slds-tabs_default__item" class:slds-is-active={tab === 'activity'} role="presentation">
				<button class="slds-tabs_default__link tab" role="tab" onclick={() => (tab = 'activity')}>Activity</button>
			</li>
		</ul>
		<div class="slds-p-around_small">
			{#if tab === 'details'}
				{#each sections as [title, rows] (title)}
					<div class="slds-section" class:slds-is-open={!closed[title]}>
						<h3 class="slds-section__title">
							<button class="slds-button slds-section__title-action" onclick={() => (closed[title] = !closed[title])}>
								<Icon name={closed[title] ? 'chevronright' : 'chevrondown'} cls="slds-button__icon slds-button__icon_left" />
								<span class="slds-truncate">{title}</span>
							</button>
						</h3>
						<div class="slds-section__content">
							<div class="slds-grid slds-wrap slds-gutters_small">
								{#each rows as [label, value] (label)}
									<div class="slds-col slds-size_1-of-2">
										<div class="slds-form-element slds-form-element_horizontal slds-form-element_readonly">
											<span class="slds-form-element__label">{label}</span>
											<div class="slds-form-element__control"><div class="slds-form-element__static">{value}</div></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<p class="slds-text-color_weak slds-p-around_medium">No activities to show.</p>
			{/if}
		</div>
	</div>
</article>

<style>
	.tab {
		background: none;
		border: none;
		cursor: pointer;
	}
	.details {
		padding: 0 12px;
	}
</style>
