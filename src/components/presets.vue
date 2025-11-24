<template>
	<label>
		{{ label }}
		<select :id="id" @change="onChange">
			<option :value="-1"></option>
			<option v-for="(opt, index) in options" :value="index">{{ opt.name }}</option>
		</select>
	</label>
</template>

<script setup lang="ts">
import { onMounted, ref, defineModel } from "vue"
import { Preset } from "../app";

type PresetOptions = {
	name: string,
	data: Preset
}
const options: PresetOptions[] = [
	{
		"name": "Vale",
		"data": {
			"bgColor": "transparent",
			"primary": "#d3cea1"
		}
	},
	{
		"name": "Enry",
		"data": {
			"bgColor": "transparent",
			"primary": "#de6cdc"
		}
	},
	{
		"name": "Marti",
		"data": {
			"bgColor": "transparent",
			"primary": "#177b91"
		}
	},
	{
		"name": "Gio",
		"data": {
			"bgColor": "transparent",
			"primary": "#93ff72"
		}
	},
	{
		"name": "Phil",
		"data": {
			"bgColor": "transparent",
			"primary": "#ffd66b"
		}
	},
	{
		"name": "Pablo",
		"data": {
			"bgColor": "transparent",
			"primary": "#8f61de"
		}
	},
	{
		"name": "Fra",
		"data": {
			"bgColor": "transparent",
			"primary": "#a6de61"
		}
	}
];
const props = defineProps({
	label: {
		type: String,
		default: "Presets"
	},
})
const id = ref(Math.random() * 1000 + "");
const emit = defineEmits(["click-import", "click-export"])
const data = defineModel({
	type: Object,
	default: () => null
})

onMounted(() => {
	data.value = null
})
function onChange(payload: any) {
	const index = +payload.target.value;
	if (index < 0)
		return data.value = null
	const opt = options[+index];
	data.value = opt.data
}
</script>
