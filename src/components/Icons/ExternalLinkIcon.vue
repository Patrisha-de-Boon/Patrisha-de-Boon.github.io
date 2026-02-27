<template>
  <!-- This icon is tabler:external-link from iconify -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill="none"
      :stroke="color"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6m-7 1l9-9m-5 0h5v5"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  size?: number;
  color?: string;
}>(), {
  size: 24,
  color: 'currentColor',
});
</script>
