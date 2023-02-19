<script lang="ts" setup>
import {ref, watch} from "vue";

const emit = defineEmits(["update:modelValue"])
const props = defineProps({
  id: String,
  type: {type: String, default: 'text'},
  label: String,
  modelValue: [String, Number],
  placeholder: {type: String, default: 'Bitte geben Sie ein...'},
  required: {type: Boolean, default: false}
})

const input = ref(props.modelValue);
const hasError = ref(false);

watch(input, (value: any) => {
  emit('update:modelValue', value.trim());
})
</script>

<template>
  <div class="labeled-input-field" :class="{'error': hasError}">
    <label v-if="label" :for="id">
      <span>{{ label }}</span>
      <span v-if="required">*</span>
    </label>
    <input v-model="input" :id="id" :type="type" :placeholder="placeholder" :value="input">
  </div>
</template>

<style lang="scss" scoped>
.labeled-input-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 512px;
  height: 32px;
  margin-bottom: 16px;

  &.error {
    input {
      border: 2px solid crimson;
      border-radius: 3px;
    }
  }

  > label {
    flex: 0 43%;
  }

  > input {
    flex: 1;
    width: 256px;
    height: 100%;
    padding: 0 4px;
  }
}
</style>