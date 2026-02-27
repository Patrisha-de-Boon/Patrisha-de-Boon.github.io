<template>
  <header>
    <div
      ref="navBarRef"
      class="nav-bar"
    >
      <h1>
        Patrisha de Boon
      </h1>
      <nav>
        <RouterLink
          v-for="link in links"
          :key="link.label"
          :id="`${link.id}-link`"
          :to="`/${link.id}`"
          class="link cut-corners"
          :class="{ focused: focusedSection === link.id }"
        >
          {{ link.label }}
          <SettingsIcon
            v-if="link.id === 'settings'"
          />
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { NavLink } from './types';
import { useTemplateRef } from 'vue';
import { useElementSize } from '@vueuse/core';
import type { Section } from '@/types/sharedTypes';
import SettingsIcon from '../Icons/SettingsIcon.vue';

defineProps<{
  links: NavLink[];
  focusedSection: Section | null;
}>();

const navBarRef = useTemplateRef('navBarRef');
const { height: navBarHeight } = useElementSize(navBarRef, undefined, { box: 'border-box' });

defineExpose({
  navBarHeight
});
</script>

<style>
@reference "#main.css";

.nav-bar {
  @apply absolute inset-0 flex items-center justify-between h-fit py-3 px-4 z-5 bg-gray-950/80 text-white;
}

nav {
  @apply flex gap-0;
}

.link {
  @apply flex items-center no-underline hover:text-white bg-transparent hover:bg-gray-700 px-3 py-1;

  &.focused {
    @apply pointer-events-none bg-gray-800;
  }
}

#settings-link {
  @apply p-1.5 ml-0.5;
}
</style>
