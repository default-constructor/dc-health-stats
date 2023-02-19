<script lang="ts" setup>

defineProps({
  id: String,
  label: String,
  modelValue: [Number, String],
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
  display: flex;
  width: 100%;

  > label {
    flex: 1;
  }

  > select {
    flex: 0;
  }
}
</style>
