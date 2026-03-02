<template>
  <div class="settings-content">
    <SliderInput
      v-model="maxFramesPerSecond"
      label="Maximum Refresh Rate"
      :info="FramesPerSecondInfo"
      :min="MIN_FRAMES_PER_SECOND"
      :max="MAX_FRAMES_PER_SECOND"
      suffix=" frames/second"
    />
    <SliderInput
      v-model="minTimeToCrossScreen"
      label="Min Time To Cross Screen"
      :info="MinTimeToCrossInfo"
      :min="MIN_TIME_TO_CROSS"
      :max="MAX_TIME_TO_CROSS"
      suffix=" seconds"
    />
    <SliderInput
      v-model="connectionDistance"
      label="Connection Distance"
      :info="ConnectionDistanceInfo"
      :min="MIN_CONNECTION_DISTANCE"
      :max="MAX_CONNECTION_DISTANCE"
      suffix="%"
    />
    <button
      class="reset-button"
      @click="reset"
    >
      Reset
    </button>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';
import SliderInput from '@/components/SliderInput/SliderInput.vue';
import { DEFAULT_CONNECTION_DISTANCE, DEFAULT_FRAMES_PER_SECOND, DEFAULT_MIN_TIME_TO_CROSS_SCREEN } from '@/shared/sharedUtils';
import { FramesPerSecondInfo, MinTimeToCrossInfo, ConnectionDistanceInfo } from '@/shared/sectionsConfig';

const MIN_FRAMES_PER_SECOND = 0;
const MAX_FRAMES_PER_SECOND = 60;
const MIN_TIME_TO_CROSS = 1;
const MAX_TIME_TO_CROSS = 200;
const MIN_CONNECTION_DISTANCE = 1;
const MAX_CONNECTION_DISTANCE = 30;

const mainStore = useMainStore();

const maxFramesPerSecond = computed({
  get: () => mainStore.maxFramesPerSecond,
  set: (newValue) => {
    mainStore.setMaxFramesPerSecond(newValue);
  },
});

const minTimeToCrossScreen = computed({
  get: () => mainStore.minTimeToCrossScreen,
  set: (newValue) => {
    mainStore.setMinTimeToCrossScreen(newValue);
  },
});

const connectionDistance = computed({
  get: () => mainStore.connectionDistance * 100,
  set: (newValue) => {
    mainStore.setConnectionDistance(newValue / 100);
  },
});

const reset = () => {
  mainStore.setMaxFramesPerSecond(DEFAULT_FRAMES_PER_SECOND);
  mainStore.setMinTimeToCrossScreen(DEFAULT_MIN_TIME_TO_CROSS_SCREEN);
  mainStore.setConnectionDistance(DEFAULT_CONNECTION_DISTANCE);
};

</script>

<style scoped>
@reference "#main.css";

.settings-content {
  @apply flex flex-col items-end w-full p-6 pr-3 gap-6;
}

.reset-button {
  @apply flex p-2 bg-gray-800 hover:bg-gray-700 w-fit text-white cut-corners
    cut-corners-border-gray-700 hover:cut-corners-border-gray-600;
}
</style>
