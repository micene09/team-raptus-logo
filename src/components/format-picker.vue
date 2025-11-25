<template>
	<select :id="id" v-model="value">
		<option>PNG</option>
		<option>SVG</option>
	</select>
</template>

<script setup lang="ts">
import { ref, defineModel } from "vue"
const props = defineProps({
	label: {
		type: String,
		default: "Format"
	}
})
const value = defineModel({
	type: String,
	default: "PNG",
	required: true
})
const id = ref(Math.random() * 1000 + "")
</script>
