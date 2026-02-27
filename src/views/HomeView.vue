<template>
  <NavBar
    ref="navBarRef"
    :links="NavLinks"
    :focused-section="focusedSection"
  />
  <main class="dark-mode">
    <ConstellationBackground
      :manual-stars="manualStars"
      :manual-lines="manualLines"
      :min-time-between-frames="minTimeBetweenFrames"
    />

    <ContentSection
      v-for="link in NavLinks"
      :key="link.id"
      ref="sectionRefs"
      :section="link.id"
      :title="link.title ?? link.label"
      :focused-section="focusedSection"
      :closed-position="getSectionPosition(link.id)"
      :min-time-between-frames="minTimeBetweenFrames"
      :max-width="link.id === 'portfolio' ? 1000 : undefined"
      :max-height="link.id === 'portfolio' ? 1000 : undefined"
      @set-focused-section="mainStore.setFocusedSection"
    >
      <PortfolioContent
        v-if="link.id === 'portfolio'"
        v-bind="PortfolioContentConfig"
      />
      <SettingsContentView
        v-if="link.id === 'settings'"
      />
      <ResumeContent
        v-if="link.id === 'resume'"
        v-bind="ResumeContentConfig"
      />
      <div
        v-else-if="link.id === 'about'"
        class="section-content"
        v-html="AboutContentConfig"
      />
    </ContentSection>
  </main>
</template>

<script setup lang="ts">
import ConstellationBackground from '@/components/ConstellationBackground/ConstellationBackground.vue';
import PortfolioContent from '@/components/PortfolioContent/PortfolioContent.vue';
import type { Line } from '@/components/ConstellationBackground/types';
import { useMainStore } from '@/stores/main';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { AboutContentConfig, PortfolioContentConfig, ResumeContentConfig } from '@/config/sectionsConfig';
import ContentSection from '@/components/ContentSection/ContentSection.vue';
import { useWindowSize } from '@vueuse/core';
import { Sections, type Bounds, type Position, type Section } from '@/types/sharedTypes';
import useTimer from '@/composables/useTimer';
import { forceSimulation, forceX, forceY } from 'd3-force';
import { bboxCollide } from 'd3-bboxCollide';
import forceLimit from 'd3-force-limit';
import NavBar from '@/components/NavBar/NavBar.vue';
import { NavLinks } from '@/config/sectionsConfig';
import SettingsContentView from '@/views/SettingsContentView.vue';
import ResumeContent from '@/components/ResumeContent/ResumeContent.vue';

const FRAMES_PER_SECOND = 30;

const mainStore = useMainStore();

const animationStarted = ref(false);
const navBarRef = useTemplateRef<InstanceType<typeof NavBar>>('navBarRef');
const sectionRefs = useTemplateRef<InstanceType<typeof ContentSection>[]>('sectionRefs');
const { width: windowWidth, height: windowHeight } = useWindowSize();
const navBarHeight = computed(() => navBarRef.value?.navBarHeight);

const sectionPositions = ref(Sections.reduce(
  (acc, current) => {
    acc[current] = { x: 0, y: 0 };
    return acc;
  },
  {} as Record<Section, Position>)
);

const minTimeBetweenFrames = computed(() => {
  if (FRAMES_PER_SECOND <= 0) {
    return 0;
  }

  return (1 / FRAMES_PER_SECOND) * 1000;
});

const focusedSection = computed(() => {
  return mainStore.focusedSection;
});

const manualStarGroups = computed(() => sectionRefs.value?.map(sectionRef => sectionRef.sectionStars) ?? []);
const manualStars = computed(() => manualStarGroups.value.flat());
const manualLines = computed(() => {
  // connect the stars from each group of manual stars in order
  return manualStarGroups.value.flatMap(groupedStars => {
    const lines: Line[] = [];
    groupedStars.forEach((star, i) => {
      const nextStar = (i + 1) < groupedStars.length ? groupedStars[i + 1] : groupedStars[0];
      if (nextStar) {
        lines.push({ x1: star.x, x2: nextStar.x, y1: star.y, y2: nextStar.y });
      }
    });
    return lines;
  });
});

const getSectionSize = (section: Section) => {
  return sectionRefs.value?.find(sectionRef => sectionRef.section === section)?.closedSize ?? null;
};

type ForceNode = Bounds & { section: Section, xSpeed?: number, ySpeed?: number };

const simulateCollisions = (
  positions: Record<Section, Position>,
  xStrength = 1,
  yStrength = 1,
) => {
  const nodes: ForceNode[] = Sections.flatMap(section => {
    const position = positions[section];
    const size = getSectionSize(section);

    if (position && size && focusedSection.value !== section) {
      return [{
        section,
        ...position,
        ...size
      }];
    }
    return [];
  });

  const simulation = forceSimulation(nodes)
    .force('x', forceX((n: ForceNode) => n.x).strength(xStrength))
    .force('y', forceY((n: ForceNode) => n.y).strength(yStrength))
    .force("collide", bboxCollide((node: ForceNode)  => [[0, 0], [node.width, node.height]]))
    .force('limit', forceLimit()
      .y0(navBarHeight.value ?? 0)
      .y1((node: ForceNode) => windowHeight.value - node.height)
      .x0(0)
      .x1((node: ForceNode) => windowWidth.value - node.width))
    .stop();

  while (simulation.alpha() > simulation.alphaMin()) {
      simulation.tick();
  }

  const newPositions = simulation.nodes().reduce(
    (acc,  node) => {
      const { x: expectedX, y: expectedY } = positions[node.section];
      let xSpeed = node.xSpeed ?? 0;
      let ySpeed = node.ySpeed ?? 0;
      const epsillon = 0.2;
      // If x or y are not the expected values then assume there has been a collision and reverse their speed
      if (Math.abs(node.x - expectedX) > epsillon) {
        xSpeed *= -1;
      }
      if (Math.abs(node.y - expectedY) > epsillon) {
        ySpeed *= -1;
      }
      acc[node.section] = { x: node.x, y: node.y, xSpeed, ySpeed };
      return acc;
    },
    {} as Record<Section, Position>
  );
  if (focusedSection.value) {
    newPositions[focusedSection.value] = positions[focusedSection.value];
  }
  return newPositions;
};

const setStartingPositions = () => {
  const newPositions = Sections.reduce(
  (acc, section) => {
    const speedDivisor = 1000;
    const newPosition: Position = {
      x: Math.random() * windowWidth.value,
      y: (navBarHeight.value ?? 0) + Math.random() * (windowHeight.value - (navBarHeight.value ?? 0)),
      xSpeed: (Math.random() - 0.5) / speedDivisor * windowWidth.value,
      ySpeed: (Math.random() - 0.5) / speedDivisor * windowHeight.value,
    };

    acc[section] = newPosition;
    return acc;
  },
  {} as Record<Section, Position>);
  sectionPositions.value = simulateCollisions(newPositions);
  animationStarted.value = true;
};

const moveSections = () => {
  const newPositions: Record<Section, Position> = {...sectionPositions.value };
  for(let i = 0; i < Sections.length; i++) {
    const section = Sections[i]!;
    const originalPosition = newPositions[section];
    const newPosition = { ...originalPosition };

    if (
      focusedSection.value === section // section doesn't move while open
      || !originalPosition
      || (!originalPosition.xSpeed && !originalPosition.ySpeed)
    ) {
      continue;
    }

    if (originalPosition.xSpeed) {
      newPosition.x = originalPosition.x + originalPosition.xSpeed;
    }
    if (originalPosition.ySpeed) {
      newPosition.y = originalPosition.y + originalPosition.ySpeed;
    }

    newPositions[section] = newPosition;
  };
  sectionPositions.value = simulateCollisions(newPositions);
};

const getSectionPosition = (section: Section) => {
  const position = sectionPositions.value[section];
  // This was an attempt to fix jitter by rounding pixel values before applying them. This just makes the jitter worse.
  // TODO: Fix jittery text. Current theory is that it might be a text rendering issue
  // return {
  //   x: Math.round(position.x),
  //   y: Math.round(position.y),
  // };
  return position;
};

useTimer({
  minTimeBetweenFrames,
  scheduledFunction: () => {
    if (animationStarted.value) {
      moveSections();
    }
  },
});

onMounted(() => {
  setStartingPositions();

  watch([windowWidth, windowHeight], () => {
    // TODO: reposition sections to keep them in the same relative position on screen
  });
});
</script>

<style scoped>
@reference "#main.css";

main {
  @apply relative w-screen h-screen;
}

.section-content {
  @apply p-6 overflow-y-auto;
}
</style>
