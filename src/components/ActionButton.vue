<script lang="ts" setup>
defineProps({
  id: String,
  label: {type: String, default: 'OK'},
  type: {type: String, default: 'button'},
  primary: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false}
})
</script>

<template>
  <button :id="id" :type="type" :disabled="disabled" class="action_button">{{ label }}</button>
</template>

<style lang="scss" scoped>
.action_button {
  margin-left: 16px;
  padding: 8px 16px;
}
</style>
