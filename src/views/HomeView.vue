<template>
  <NavBar
    ref="navBarRef"
    :links="NavLinks"
    :focused-section="focusedSection"
  />
  <main class="dark-mode">
    <ConstellationBackground
      :manual-sections="manualSections"
      :min-time-between-frames="minTimeBetweenFrames"
      :max-x-speed="maxXSpeed"
      :max-y-speed="maxYSpeed"
      :connection-distance="connectionDistance"
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
import { AboutContentConfig, PortfolioContentConfig, ResumeContentConfig } from '@/shared/sectionsConfig';
import ContentSection from '@/components/ContentSection/ContentSection.vue';
import { useWindowSize } from '@vueuse/core';
import { Sections, type Bounds, type Position, type PositionProps, type PositionRatioChange, type Section } from '@/shared/sharedTypes';
import useTimer from '@/composables/useTimer';
import { forceSimulation, forceX, forceY } from 'd3-force';
import { bboxCollide } from 'd3-bboxCollide';
import forceLimit from 'd3-force-limit';
import NavBar from '@/components/NavBar/NavBar.vue';
import { NavLinks } from '@/shared/sectionsConfig';
import SettingsContentView from '@/views/SettingsContentView.vue';
import ResumeContent from '@/components/ResumeContent/ResumeContent.vue';
import { getRandomSpeed, moveWithSpeed, ratioPositionProps, updateWaitingPropsToRatio } from '@/shared/sharedUtils';
import { debounce, filter, isEmpty, isNil, map } from 'lodash-es';

const mainStore = useMainStore();

const animationStarted = ref(false);
const propsWaitingToRatio = ref<Partial<Record<PositionProps, PositionRatioChange>>>({});

const navBarRef = useTemplateRef<InstanceType<typeof NavBar>>('navBarRef');
const sectionRefs = useTemplateRef<InstanceType<typeof ContentSection>[]>('sectionRefs');
const { width: windowWidth, height: windowHeight } = useWindowSize();
const navBarHeight = computed(() => navBarRef.value?.navBarHeight);

const sectionPositions = ref(Sections.reduce(
  (acc, current) => {
    acc[current] = { x: 0, y: 0, xSpeed: 0, ySpeed: 0 };
    return acc;
  },
  {} as Record<Section, Position>)
);

const minTimeBetweenFrames = computed(() => {
  if (mainStore.maxFramesPerSecond <= 0) {
    return 0;
  }

  return (1 / mainStore.maxFramesPerSecond) * 1000;
});

const minTimeToCrossScreen = computed(() => mainStore.minTimeToCrossScreen);
const connectionDistance = computed(() => mainStore.connectionDistance);
const focusedSection = computed(() => mainStore.focusedSection);

const manualSections = computed(() => sectionRefs.value?.map(sectionRef => sectionRef.manualSection) ?? []);

const getSectionSize = (section: Section) => {
  return sectionRefs.value?.find(sectionRef => sectionRef.section === section)?.closedSize ?? null;
};

type ForceNode = Bounds & { section: Section, xSpeed: number, ySpeed: number };

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

const maxXSpeed = computed(() => windowWidth.value / minTimeToCrossScreen.value);
const maxYSpeed = computed(() => windowHeight.value / minTimeToCrossScreen.value);

const setStartingPositions = () => {
  const newPositions = Sections.reduce(
  (acc, section) => {
    const newPosition: Position = {
      x: Math.random() * windowWidth.value,
      y: (navBarHeight.value ?? 0) + Math.random() * (windowHeight.value - (navBarHeight.value ?? 0)),
      xSpeed: getRandomSpeed(maxXSpeed.value),
      ySpeed: getRandomSpeed(maxYSpeed.value),
    };

    acc[section] = newPosition;
    return acc;
  },
  {} as Record<Section, Position>);
  sectionPositions.value = simulateCollisions(newPositions);
  animationStarted.value = true;
};

const moveSections = (deltaT: number) => {
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
      newPosition.x = moveWithSpeed(originalPosition.x, originalPosition.xSpeed, deltaT);
    }
    if (originalPosition.ySpeed) {
      newPosition.y = moveWithSpeed(originalPosition.y, originalPosition.ySpeed, deltaT);
    }

    newPositions[section] = newPosition;
  };
  sectionPositions.value = simulateCollisions(newPositions);
};

const getSectionPosition = (section: Section) => {
  const position = sectionPositions.value[section];
  return position;
};

const ratioStarProps = debounce(() => {
  const propsToRatio = filter(propsWaitingToRatio.value, (p) => !!p);
  propsWaitingToRatio.value = {};
  const positions = map(sectionPositions.value, (p, section) => ({ ...p, section: section as Section }));

  const newPositions = ratioPositionProps(propsToRatio, positions);
  sectionPositions.value = newPositions.reduce((acc, position) => {
    acc[position.section] = position;
    return acc;
  }, {} as Record<Section, Position>);
}, 200);

useTimer({
  minTimeBetweenFrames,
  scheduledFunction: (t, lastT) => {
    // wait for animation to start and don't animate while waiting for queue of prop changes,
    // like when the user is resizing the window.
    // If you animate while waiting for changes then the sections can be pushed by the boundary
    // shrinking and end up grouped in a vertical line along the side of the window.
    if (animationStarted.value && isEmpty(propsWaitingToRatio.value)) {
      const deltaT = isNil(lastT) ? t : t - lastT;
      moveSections(deltaT);
    }
  },
});

onMounted(() => {
  setStartingPositions();

  watch([windowWidth, windowHeight, maxXSpeed, maxYSpeed], (
    newValues,
    oldValues
  ) => {
    updateWaitingPropsToRatio(propsWaitingToRatio, newValues, oldValues);

    // trigger the debounced function to update the waiting props when changes are done
    ratioStarProps();
  });
});
</script>

<style scoped>
@reference "#main.css";

main {
  @apply relative w-screen h-screen;
}

.section-content {
  @apply p-6;
}
</style>
