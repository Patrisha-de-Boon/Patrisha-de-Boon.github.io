<template>
  <div
    v-if="closedPosition"
    ref="sectionRef"
    :id="section"
    class="section"
    :class="{
      open: isOpen,
      transitioning: isTransitioning
    }"
  >
    <button
      class="title-button"
      type="button"
      @click="toggleSection"
    >
      <div
        ref="titleRef"
        class="section-title"
      >
        {{ title }}
      </div>
    </button>
    <div
      v-if="isOpen"
      class="section-content"
      :style="{
        maxHeight: maxSectionHeight
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ManualSection, type Line, type Star } from '@/components/ConstellationBackground/types';
import { onClickOutside, useElementBounding, useElementSize, useWindowSize } from '@vueuse/core';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { select } from 'd3-selection';
import 'd3-transition';
import { type Bounds, type Position, type Section } from '@/shared/sharedTypes';
import { debounce, isEqual } from 'lodash-es';
import { CUT_CORNER_OFFSET } from '@/shared/sharedUtils';

const OPEN_PADDING = 8;

const props = withDefaults(defineProps<{
  section: Section;
  focusedSection: Section | null;
  title: string;
  closedPosition: Position | undefined;
  minTimeBetweenFrames: number;
  maxWidth?: number;
  maxHeight?: number;
}>(), {
  maxWidth: 600,
  maxHeight: 650
});

const emit = defineEmits<{
    (event: 'setFocusedSection', value: Section | null): void;
}>();

const isTransitioning = ref(false);
const isOpen = ref(false);

const sectionRef = useTemplateRef('sectionRef');
const titleRef = useTemplateRef('titleRef');
const { width: titleWidth, height: titleHeight } = useElementSize(titleRef, undefined, { box: 'border-box' });
const sectionBounds = useElementBounding(sectionRef);
const { width: windowWidth, height: windowHeight } = useWindowSize();

const openPosition = computed<Bounds>(() => {
  const width = Math.min(windowWidth.value - (2 * OPEN_PADDING), props.maxWidth);
  const height = Math.min(windowHeight.value - (2 * OPEN_PADDING), props.maxHeight);

  const x = (windowWidth.value / 2) - (width / 2);
  const y = (windowHeight.value / 2) - (height / 2);

  return {
    x,
    y,
    width,
    height
  };
});

const maxSectionHeight = computed(() => {
  return `${openPosition.value.height - titleHeight.value - OPEN_PADDING}px`;
});

const closedSize = computed(() => ({
  width: titleWidth.value,
  height: titleHeight.value
}));

const closedBounds = computed(() => props.closedPosition ? {
  ...props.closedPosition,
  ...closedSize.value
} : null);

const sectionStars = computed(() => {
  const { x, y, width, height } = sectionBounds;

  const stars: Star[] = [];
  const baseStar: Star = { x: 0, y: 0, xSpeed: 0, ySpeed: 0 };

  const cornerOffset = CUT_CORNER_OFFSET;

  // add stars to either side of the corners for a beveled look
  stars.push({ ...baseStar, x: x.value + cornerOffset, y: y.value });
  stars.push({ ...baseStar, x: x.value + width.value - cornerOffset, y: y.value });
  stars.push({ ...baseStar, x: x.value + width.value, y: y.value + cornerOffset });
  stars.push({ ...baseStar, x: x.value + width.value, y: y.value + height.value - cornerOffset});
  stars.push({ ...baseStar, x: x.value + width.value - cornerOffset, y: y.value + height.value});
  stars.push({ ...baseStar, x: x.value + cornerOffset, y: y.value + height.value });
  stars.push({ ...baseStar, x: x.value, y: y.value + height.value -  cornerOffset});
  stars.push({ ...baseStar, x: x.value, y: y.value + cornerOffset });
  return stars;
});

const sectionLines = computed(() => {
  const lines: Line[] = [];
  const stars = sectionStars.value;
  stars.forEach((star, i) => {
    const nextStar = (i + 1) < stars.length ? stars[i + 1] : stars[0];
    if (nextStar) {
      lines.push({ x1: star.x, x2: nextStar.x, y1: star.y, y2: nextStar.y });
    }
  });
  return lines;
});

const sectionText = computed(() => {
  if (isTransitioning.value) {
    return [];
  }

  return [{
    text: props.title,
    x: sectionBounds.x.value + 8,
    y: sectionBounds.y.value + 14
  }];
});

const manualSection = computed<ManualSection>(() => ({
  stars: sectionStars.value,
  lines: sectionLines.value,
  text: sectionText.value,
}));

// Use d3 transitions instead of css transitions so useElemntBounding can be responsive
const transitionBounds = (
  newPosition: Bounds,
  duration = 300,
  callback?: () => void
)=> {
  const sectionId = `#${props.section}`;
  select(sectionId)
    .transition()
    .duration(duration)
    .style('width', () => `${newPosition.width}px`)
    .style('height',  () =>`${newPosition.height}px`)
    .style('top',  () => `${newPosition.y}px`)
    .style('left',  () => `${newPosition.x}px`)
    .on('end', () => {
      if (callback) {
        callback();
      }
    });
};

const openSection = () => {
  isTransitioning.value = true;
  transitionBounds(openPosition.value, undefined, () => {
    isOpen.value = true;
    if (props.focusedSection !== props.section) {
      // when opening don't set focus until transition is done.
      // This ensures there is room for the content and the section
      // doesn't unnecessarily show a scroll bar during the transition
      emit('setFocusedSection', props.section);
    }
    isTransitioning.value = false;
  });
};

const closeSection = () => {
  if (closedBounds.value) {
    if (props.focusedSection === props.section) {
      isTransitioning.value = true;
      transitionBounds(closedBounds.value, undefined, () => {
        isTransitioning.value = false;
      });
    }
    isOpen.value = false;
    if (props.focusedSection === props.section) {
      emit('setFocusedSection', null);
    }
  }
};

const toggleSection = debounce(() => {
  if (props.focusedSection === props.section) {
    closeSection();
  } else {
    openSection();
  }
}, 100);

onClickOutside(sectionRef, () => {
  if (props.focusedSection === props.section) {
    closeSection();
  }
},{ ignore: [ '.ignored-by-on-click-outside' ] });

onMounted(() => {
  watch(openPosition, () => {
    // Reposition the open section when open position changes (usually after a window resize)
    if (props.focusedSection === props.section) {
      transitionBounds(openPosition.value, 0);
    }
  });

  watch(() => props.focusedSection, () => {
    if (props.focusedSection === props.section && !isOpen.value) {
      openSection();
    } else if (props.focusedSection !== props.section && isOpen.value) {
      closeSection();
    }
  }, { immediate: true });

  watch(closedBounds, (newPosition, oldPosition) => {
    if (
      !isTransitioning.value
      && props.focusedSection !== props.section
      && !isEqual(newPosition, oldPosition)
      && closedBounds.value
    ) {
      transitionBounds(closedBounds.value, 100);
    }
  });
});

defineExpose({
  section: computed(() => props.section),
  closedSize,
  manualSection,
  isTransitioning,
});
</script>

<style scoped>
@reference "#main.css";

.section {
  @apply absolute top-1 left-1 z-2 text-white w-fit bg-gray-900/90 cut-corners;
}

.section-content {
  @apply overflow-auto;

  scrollbar-gutter: stable;
}

.title-button {
  @apply flex items-center justify-center w-full hover:bg-gray-700 cursor-pointer text-lg;
}

.section-title {
  @apply p-[8px] w-fit whitespace-nowrap invisible;
}

.open {
  @apply bg-gray-900 z-4 overflow-clip;
}

.transitioning, .open {
  .title-button {
    @apply bg-gray-800 hover:bg-gray-700;
  }

  .section-title {
    @apply visible;
  }
}
</style>
