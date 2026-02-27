<template>
  <button
    type="button"
    class="fullscreen-image-button"
    @click="() => setFullscreen(true)"
  >
    <img
      class="cut-corners"
      :src="src"
      :alt="alt"
    />
    <Teleport
      v-if="isFullscreen"
      to="body"
    >
      <button
        ref="fullscreenImageRef"
        class="fullscreen-image ignored-by-on-click-outside"
        type="button"
        @click.capture="() => setFullscreen(false)"
      >
        <img
          class="cut-corners"
          :src="src"
          :alt="alt"
        />
      </button>
    </Teleport>
  </button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

defineProps<{
  src: string;
  alt?: string;
}>();

const isFullscreen = ref(false);
const fullscreenImageRef = useTemplateRef('fullscreenImageRef');

const setFullscreen = (newValue: boolean) => {
  isFullscreen.value = newValue;
};
</script>

<style scoped>
@reference "#main.css";

.fullscreen-image-button {
  @apply cursor-zoom-in;
}

.fullscreen-image {
  @apply absolute inset-0 flex items-center justify-center w-screen max-h-screen p-4 z-100 cursor-zoom-out;

  img {
    @apply max-w-full max-h-full;
    width: max-content;
    height: max-content;
  }
}
</style>
