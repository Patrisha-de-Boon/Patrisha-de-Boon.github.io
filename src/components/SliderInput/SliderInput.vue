<template>
  <div class="slider-input">
    <div
      v-if="label"
      class="label"
    >
      {{ label }}
      <InfoIcon
        v-if="info"
        :tooltip="info"
      />
      <WarningIcon
        v-if="warning"
        :tooltip="warning"
        class="text-amber-400"
      />
    </div>
    <div class="inputs">
      <PrimeSlider
        v-model="value"
        :min="min"
        :max="max"
        class="slider"
      />
      <PrimeInputNumber
        v-model="value"
        :min="min"
        :max="max"
        :pt="inputPt"
        :prefix="prefix"
        :suffix="suffix"
        class="number-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PrimeSlider from "primevue/slider";
import PrimeInputNumber, { type InputNumberProps } from "primevue/inputnumber";
import InfoIcon from "../Icons/InfoIcon.vue";
import WarningIcon from "../Icons/WarningIcon.vue";

withDefaults(defineProps<{
  min: number,
  max: number,
  label?: string,
  info?: string,
  warning?: string,
  prefix?: string,
  suffix?: string,
  inputPt?: InputNumberProps['pt'],
}>(), {
  label: undefined,
  info: undefined,
  warning: undefined,
  prefix: undefined,
  suffix: undefined,
  inputPt: () => ({
    pcInputText: {
      root: 'w-40 text-end'
    }
  })
});

const value = defineModel<number>();
</script>

<style scoped>
@reference "#main.css";

.slider-input {
  @apply flex flex-col w-full;
}

.label {
  @apply flex gap-2;
}

.inputs {
  @apply flex w-full grow shrink-0 gap-6 items-center;
}

.slider {
  @apply flex grow;

  --p-slider-range-background: white;
  --p-slider-track-background: var(--color-gray-600);
}

.number-input {
  @apply cut-corners;

  --p-inputtext-color: black;
  --p-inputtext-background: var(--color-gray-300);
}
</style>
