import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { Sections, type Section } from '@/types/sharedTypes';
import { useRoute, useRouter } from 'vue-router';

export const useMainStore = defineStore('main', () => {
  const route = useRoute();
  const router = useRouter();

  const focusedSection = ref<Section | null>(null);
  const maxFramesPerSecond = ref(30);
  const speedLimit = ref(10); // pixels per second
  const connectionDistance = ref(50); // pixels

  const setFocusedSection = (newFocus: Section | null) => {
    focusedSection.value = newFocus;
  };

  const setMaxFramesPerSecond = (newFps: number) => {
    maxFramesPerSecond.value = newFps;
  };

  const setSpeedLimit = (newLimit: number) => {
    speedLimit.value = newLimit;
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
    speedLimit: computed(() => speedLimit.value),
    connectionDistance: computed(() => connectionDistance.value),
    setFocusedSection,
    setMaxFramesPerSecond,
    setSpeedLimit,
    setConnectionDistance,
  };
});
