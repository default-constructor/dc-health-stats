<script lang="ts" setup>
import {defineEmits, defineProps} from "vue"

const props = defineProps({
  id: String,
  label: String,
  modelValue: String,
  options: Array
})

const emit = defineEmits(["update:modelValue"])

const updateModelValue = (event: any) => {
  emit("update:modelValue", event.target.value)
}
</script>

<template>
  <div class="labeled-select">
    <label :for="id">{{ label }}</label>
    <select :id="id" :value="modelValue" @input="updateModelValue">
      <option v-for="option in options" :value="option">{{ option }}</option>
    </select>
  </div>
</template>

<style lang="scss">
.labeled-select {

}
</style>
