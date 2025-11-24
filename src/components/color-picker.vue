<template>
	<label :for="id">
		{{ label }}
		<fieldset role="group">
			<input style="width: 5rem;" type="color" v-model="value" />
			<input type="text" v-model="value" :placeholder="label" :aria-label="label" :id="id" />
		</fieldset>
	</label>
</template>

<script setup lang="ts">
import { ref, defineModel } from "vue"

const props = defineProps({
	label: {
		type: String,
		default: ""
	},
	modelValue: {
		type: String,
		default: "",
		required: true
	}
})
const value = defineModel({
	type: String,
	default: "",
	required: true
})
const id = ref(Math.random() * 1000 + "")
</script>
