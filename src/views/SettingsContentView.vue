<template>
  <div class="settings-content">
    <h3>
      Max Frames Per Second
    </h3>
    <div class="slider-with-input">
      <div class="slider">
        <PrimeSlider
          v-model="maxFramesPerSecond"
        />
      </div>
      <PrimeInputNumber
        v-model="maxFramesPerSecond"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import PrimeSlider from "primevue/slider";
import PrimeInputNumber from "primevue/inputnumber";
import { computed } from 'vue';

const mainStore = useMainStore();

const maxFramesPerSecond = computed({
  get: () => mainStore.maxFramesPerSecond,
  set: (newValue) => {
    mainStore.setMaxFramesPerSecond(newValue);
  },
});


</script>

<style scoped>
@reference "#main.css";

.settings-content {
  @apply flex flex-col w-full;
}

.slider-with-input {
  @apply flex w-full grow shrink-0 gap-1;

  .slider {
    @apply flex grow;
  }
}

</style>
