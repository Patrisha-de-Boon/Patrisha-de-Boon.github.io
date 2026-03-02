import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { Sections, type Section } from '@/shared/sharedTypes';
import { useRoute, useRouter } from 'vue-router';
import { DEFAULT_CONNECTION_DISTANCE, DEFAULT_FRAMES_PER_SECOND, DEFAULT_MIN_TIME_TO_CROSS_SCREEN } from '@/shared/sharedUtils';

export const useMainStore = defineStore('main', () => {
  const route = useRoute();
  const router = useRouter();

  const focusedSection = ref<Section | null>(null);
  const maxFramesPerSecond = ref(DEFAULT_FRAMES_PER_SECOND);
  const minTimeToCrossScreen = ref(DEFAULT_MIN_TIME_TO_CROSS_SCREEN); // seconds

  // This is a percentage of min(windowWidth, windowHeight).
  const connectionDistance = ref(DEFAULT_CONNECTION_DISTANCE);

  const setFocusedSection = (newFocus: Section | null) => {
    focusedSection.value = newFocus;
  };

  const setMaxFramesPerSecond = (newFps: number) => {
    maxFramesPerSecond.value = newFps;
  };

  const setMinTimeToCrossScreen = (newLimit: number) => {
    minTimeToCrossScreen.value = newLimit;
  };

  const setConnectionDistance = (newDistance: number) => {
    connectionDistance.value = newDistance;
  };

  watch(() => route.name, () => {
    if (route.name && Sections.includes(route.name as Section) && focusedSection.value !== route.name) {
      setFocusedSection(route.name as Section);
    }
  }, { immediate: true });

  watch(focusedSection, () => {
    if (route.name !== focusedSection.value) {
      router.push(`/${focusedSection.value ?? ''}`);
    }
  });

  return {
    focusedSection: computed(() => focusedSection.value),
    maxFramesPerSecond: computed(() => maxFramesPerSecond.value),
    minTimeToCrossScreen: computed(() => minTimeToCrossScreen.value),
    connectionDistance: computed(() => connectionDistance.value),
    setFocusedSection,
    setMaxFramesPerSecond,
    setMinTimeToCrossScreen,
    setConnectionDistance,
  };
});
