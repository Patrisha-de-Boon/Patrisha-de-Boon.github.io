<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    v-tooltip="tooltipProps"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  size?: number;
  tooltip?: string;
  viewBox?: string;
}>(), {
  size: 24,
  tooltip: undefined,
  viewBox: "0 0 24 24"
});

const tooltipProps = computed(() => {
  if (!props.tooltip) {
    return undefined;
  }

  return {
    value: props.tooltip,
    pt: {
      root: {
        style: {
          translate: `${props.size/2}px`
        }
      },
      arrow: {
        style: {
          translate: `${props.size/2}px`
        }
      }
    }
  };
});
</script>
