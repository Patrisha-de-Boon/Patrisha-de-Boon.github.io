<template>
  <!-- This icon is tabler:alert-triangle from iconify -->
  <IconWithTooltip
    :size="size"
    :tooltip="tooltip"
  >
    <path
      fill="none"
      :stroke="color"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 9v4m-1.637-9.409L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0M12 16h.01"
    />
  </IconWithTooltip>
</template>

<script setup lang="ts">
import IconWithTooltip from './IconWithTooltip.vue';

withDefaults(defineProps<{
  size?: number;
  color?: string;
  tooltip?: string;
}>(), {
  size: 24,
  color: 'currentColor',
  tooltip: undefined,
});
</script>
