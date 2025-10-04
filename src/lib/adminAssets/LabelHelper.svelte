<script lang="ts">
	let { 
		mainTextBold, 
		mainTextNormal, 
		altLabel, 
		placeholder, 
		inputValue,
		onValueChange
	} = $props<{
		mainTextBold: string;
		mainTextNormal: string;
		altLabel: string;
		placeholder: string;
		inputValue: string | number | undefined;
		onValueChange: (value: number) => void;
	}>();
</script>

<div class="form-control">
	<label class="label">
		<span class="label-text font-medium">{mainTextBold}</span>
		<span class="label-text-alt">{mainTextNormal}</span>
	</label>
	<input 
		type="number" 
		class="input-bordered input" 
		{placeholder} 
		value={inputValue}
		on:input={(e) => onValueChange(Number(e.currentTarget.value))}
	/>
	<label class="label">
		<span class="label-text-alt text-xs">{altLabel}</span>
	</label>
</div>