<template>
  <div class="portfolio-content">
    <div
      class="body"
      v-html="body"
    />
    <div class="portfolio-items-container cut-corners">
      <div
        v-for="item in items"
        :key="item.id"
        class="portfolio-item"
        :class="{ open: openItem === item.id }"
      >
        <div
          class="item-header cut-corners"
          @mousedown="toggleOpen($event, item.id)"
          @keydown="toggleOpen($event, item.id)"
        >
          <template
            v-for="(title, i) in item.titles"
            :key="title"
          >
            <span>
              {{ title }}
            </span>
            <a
              class="external-link"
              :href="item.urls[i] ?? item.urls[0]"
              target='blank'
              rel='noopener'
            >
              <ExternalLinkIcon
                class="external-link-icon"
                :size="20"
              />
            </a>{{ i < item.titles.length - 1 && item.titles.length > 2 ? ',' : '' }}
            {{ i === item.titles.length - 2 ? 'and ' : ''}}
          </template>
        </div>
        <div
          v-if="openItem === item.id"
          class="item-content"
        >
          <div
            class="item-text"
            v-html="item.text"
          />
          <div class="images">
            <FullscreenImage
              class="image"
              v-for="imagePath in (item.imagePaths ?? [])"
              :key="imagePath"
              :src="imagePath"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { PortfolioContentProps } from './types';
import FullscreenImage from '../FullscreenImage/FullscreenImage.vue';
import ExternalLinkIcon from '../Icons/ExternalLinkIcon.vue';

defineProps<PortfolioContentProps>();

const openItem = ref<string | null>(null);

const toggleOpen = (event: MouseEvent | KeyboardEvent, itemId: string) => {
  if ((event.target as HTMLElement)?.tagName?.toLowerCase() === 'a'){
    return;
  }

  if (openItem.value === itemId) {
    openItem.value = null;
  } else {
    openItem.value = itemId;
  }
};
</script>

<style scoped>
@reference "#main.css";

.portfolio-content {
  @apply p-2 pl-5.5;
}

.body {
  @apply pt-4;
}

.portfolio-items-container {
  @apply p-px;
  --cut-corner-border: var(--color-gray-400);
}

.external-link {
  @apply mb-1 hidden;
}

.external-link-icon {
  @apply pointer-events-none;
}

.portfolio-item {
  @apply overflow-clip;

  .item-header {
    @apply inline-flex items-center gap-1 w-full hover:bg-gray-700 px-4 py-2 border-t border-gray-400;
  }

  .item-content {
    @apply flex flex-col p-4 gap-3;

    .images {
      @apply flex flex-wrap gap-4;

      @media (max-width: 40rem) {
        .image {
          max-width: 100%;
        }
      }
      @media (min-width: 40rem) {
        .image {
          max-width: calc(50% - 8px);
        }
      }
    }
  }

  &.open {
    .item-header {
      @apply border-b bg-gray-800 hover:bg-gray-700;
    }

    .external-link {
      @apply inline;
    }
  }

  &:first-child {
    .item-header {
      @apply border-t-0;
    }
  }
}

</style>
