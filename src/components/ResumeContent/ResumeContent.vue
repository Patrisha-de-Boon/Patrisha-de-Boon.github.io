<template>
  <div class="resume-content">
    <div
      v-html="leadingText"
      class="leading-text"
    />
    <a
      href="/resume.pdf"
      target='blank'
      rel='noopener'
      class="open-resume cut-corners"
    >
      Open Resume
      <ExternalLinkIcon
        class="pb-0.5"
        :size="20"
      />
    </a>
    <h3 v-html="tldrHeader" />
    <div
      class="tldr-text"
      v-html="tldrText"
    />
  </div>
</template>

<script setup lang="ts">
import ExternalLinkIcon from '../Icons/ExternalLinkIcon.vue';
import type { ResumeContentProps } from './types';

defineProps<ResumeContentProps>();

</script>

<style scoped>
@reference "#main.css";

.resume-content{
  @apply flex flex-col gap-4;
}

.open-resume {
  @apply flex items-center justify-center gap-1 no-underline p-2 bg-gray-800 hover:bg-gray-700 text-white;
}

.resume-content {
  @apply p-6 pr-4;
}

.tldr-text {
  @apply flex flex-col gap-4 pl-6;
}
</style>
