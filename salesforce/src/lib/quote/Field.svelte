<script lang="ts">
	let {
		label,
		name,
		value = $bindable(),
		type = 'text',
		required = false,
		disabled = false,
		help
	}: { label: string; name?: string; value?: string | number | null; type?: 'text' | 'number' | 'textarea'; required?: boolean; disabled?: boolean; help?: string } = $props();
	const id = `f-${Math.random().toString(36).slice(2)}`;
</script>

<div class="slds-form-element slds-m-bottom_small">
	<label class="slds-form-element__label" for={id}>
		{#if required}<abbr class="slds-required" title="required">* </abbr>{/if}{label}
	</label>
	<div class="slds-form-element__control">
		{#if type === 'textarea'}
			<textarea {id} {name} class="slds-textarea" rows="3" bind:value {disabled}></textarea>
		{:else if type === 'number'}
			<input {id} {name} class="slds-input" type="number" step="any" bind:value {required} {disabled} />
		{:else}
			<input {id} {name} class="slds-input" type="text" bind:value {required} {disabled} />
		{/if}
	</div>
	{#if help}<div class="slds-form-element__help">{help}</div>{/if}
</div>
