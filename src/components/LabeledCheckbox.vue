<script lang="ts" setup>

defineProps({
  id: String,
  label: String,
  modelValue: Boolean
})

const emit = defineEmits(["update:modelValue"])

const updateModelValue = (event: any) => {
  emit("update:modelValue", event.target.checked)
}
</script>

<template>
  <div class="labeled-checkbox">
    <input :id="id" type="checkbox" :checked="modelValue" @change="updateModelValue"/>
    <label :for="id">{{ label }}</label>
  </div>
</template>

<style lang="scss">
.labeled-checkbox {

}
</style>
