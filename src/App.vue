<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'App'
});
</script>

<template>
  <router-view v-slot="{Component}">
    <suspense>
      <main>
        <component :is="Component"/>
      </main>
    </suspense>
  </router-view>
</template>
