<script lang="ts">
	import Icon from '../ui/Icon.svelte';
	import { act } from './act.ts';

	let { status, statuses }: { status: string; statuses: string[] } = $props();
	let selected = $state<string | null>(null);

	// Denied is the alternative end: it never counts as a completed step.
	const order = $derived(statuses.filter((s) => s !== 'Denied'));
	const reached = $derived(status === 'Denied' ? -1 : order.indexOf(status));
	const next = $derived(reached >= 0 && reached < order.length - 1 ? order[reached + 1] : null);
	const active = $derived(selected ?? status);

	function stateOf(step: string) {
		if (step === status) return 'slds-is-current';
		if (step !== 'Denied' && order.indexOf(step) < reached) return 'slds-is-complete';
		return 'slds-is-incomplete';
	}

	async function mark() {
		const target = selected && selected !== status ? selected : next;
		if (!target) return;
		if ((await act('status', { status: target })) === true) selected = null;
	}
</script>

<div class="slds-card slds-p-around_x-small path">
	<div class="slds-path">
		<div class="slds-grid slds-path__track">
			<div class="slds-grid slds-path__scroller-container">
				<div class="slds-path__scroller">
					<div class="slds-path__scroller_inner">
						<ul class="slds-path__nav" role="listbox">
							{#each statuses as step (step)}
								<li class="slds-path__item {stateOf(step)}" class:slds-is-active={step === active} role="presentation">
									<button class="slds-path__link" role="option" aria-selected={step === active} title={step} onclick={() => (selected = step)}>
										<span class="slds-path__stage"><Icon name="check" cls="slds-icon slds-icon_x-small" /></span>
										<span class="slds-path__title">{step}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
			<div class="slds-grid slds-path__action">
				<button class="slds-button slds-button_brand slds-path__mark-complete" disabled={!(selected && selected !== status) && !next} onclick={mark}>
					{#if selected && selected !== status}
						Mark as Current Status
					{:else}
						<Icon name="check" cls="slds-button__icon slds-button__icon_left" />Mark Status as Complete
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.path {
		margin: 12px 0;
	}
	.slds-path__link {
		width: 100%;
		border: none;
		background: none;
		cursor: pointer;
	}
</style>
