<script lang="ts">
	import { addDays, date, money } from '../format.ts';
	import Icon from '../ui/Icon.svelte';
	import { act, notInToy } from './act.ts';

	let { quote }: { quote: Record<string, any> } = $props();
</script>

<div class="slds-page-header slds-page-header_record-home">
	<div class="slds-page-header__row">
		<div class="slds-page-header__col-title">
			<div class="slds-media">
				<div class="slds-media__figure">
					<span class="slds-icon_container slds-icon-standard-quotes"><Icon name="quotes" cls="slds-icon slds-page-header__icon" /></span>
				</div>
				<div class="slds-media__body">
					<div class="slds-page-header__name">
						<div class="slds-page-header__name-title">
							<h1>
								<span>Quote</span>
								<span class="slds-page-header__title slds-truncate" title={quote.Name}>{quote.Name}</span>
							</h1>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="slds-page-header__col-actions">
			<div class="slds-page-header__controls">
				<div class="slds-page-header__control">
					<ul class="slds-button-group-list">
						<li><button class="slds-button slds-button_neutral" onclick={() => notInToy('Attach new or existing building')}>Attach new or existing building</button></li>
						<li><a class="slds-button slds-button_neutral" href="/apex/VF_WM_QuoteTemplate?quoteId={quote.Id}" target="_blank">Generate Quote PDF</a></li>
						<li><button class="slds-button slds-button_neutral" onclick={() => notInToy('Email Quote')}>Email Quote</button></li>
						<li><button class="slds-button slds-button_neutral" onclick={() => act('clone')}>Clone</button></li>
						<li><button class="slds-button slds-button_neutral" onclick={() => notInToy('Apply Margin')}>Apply Margin</button></li>
						<li><button class="slds-button slds-button_neutral" onclick={() => notInToy('Apply Discount')}>Apply Discount</button></li>
						<li><button class="slds-button slds-button_neutral" onclick={() => notInToy('Increase Price')}>Increase Price</button></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="slds-page-header__row slds-page-header__row_gutters">
		<div class="slds-page-header__col-details">
			<ul class="slds-page-header__detail-row">
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Quote Number</div>
					<div class="slds-truncate">{quote.QuoteNumber}</div>
				</li>
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Expiration Date</div>
					<div class="slds-truncate">{date(addDays(quote.CreatedDate, 30))}</div>
				</li>
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Syncing</div>
					<div><Icon name="check" cls="slds-icon slds-icon_x-small slds-icon-text-default" /></div>
				</li>
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Opportunity Name</div>
					<div class="slds-truncate"><a href={'#'} onclick={(e) => { e.preventDefault(); notInToy('Opportunities'); }}>{quote.Name}</a></div>
				</li>
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Account Name</div>
					<div class="slds-truncate"><a href={'#'} onclick={(e) => { e.preventDefault(); notInToy('Accounts'); }}>{quote.Account?.Name}</a></div>
				</li>
				<li class="slds-page-header__detail-block">
					<div class="slds-text-title slds-truncate">Grand Total</div>
					<div class="slds-truncate">{money(quote.GrandTotal, quote.CurrencyIsoCode)}</div>
				</li>
			</ul>
		</div>
	</div>
</div>
