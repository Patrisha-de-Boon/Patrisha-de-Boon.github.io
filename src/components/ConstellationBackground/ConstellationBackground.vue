<template>
  <canvas
    ref="linesCanvasRef"
    class="lines-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    :style="canvasStyle"
  />
  <canvas
    ref="starsCanvasRef"
    class="stars-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    :style="canvasStyle"
  />
  <canvas
    ref="manualCanvasRef"
    class="manual-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    :style="canvasStyle"
  />
</template>

<script setup lang="ts">
import { useMouse, useWindowSize } from '@vueuse/core';
import { useTemplateRef, ref, watch, computed, onMounted, shallowRef } from 'vue';
import { drawCircle, drawLine, drawText, getDistance, makeRadialGradient } from './utils';
import { LINE_STROKE, LINE_MOUSE_GRADIENT_END_COLOR,
  MOUSE_GRADIENT_END_RADIUS, STAR_MOUSE_GRADIENT_END_COLOR, STAR_MOUSE_GRADIENT_START_COLOR,
  LINE_MOUSE_GRADIENT_START_COLOR, MOUSE_GRADIENT_START_RADIUS, STAR_FILL, STAR_RADIUS,
  MANUAL_STAR_RADIUS,
  MANUAL_LINE_WIDTH,
  LINE_WIDTH,
  MANUAL_MOUSE_GRADIENT_END_COLOR,
  MANUAL_MOUSE_GRADIENT_START_COLOR
} from './constants';
import type { Line, Star, ManualSection } from './types';
import useTimer from '@/composables/useTimer';
import { debounce, filter, isEmpty, isNil } from 'lodash-es';
import { getRandomSpeed, moveWithSpeed, ratioPositionProps, updateWaitingPropsToRatio } from '@/shared/sharedUtils';
import type { PositionRatioChange, PositionProps } from '@/shared/sharedTypes';

const props = withDefaults(defineProps<{
  manualSections: ManualSection[];
  numStars?: number;
  minTimeBetweenFrames: number; // milliseconds
  maxXSpeed: number; // pixels per second
  maxYSpeed: number; // pixels per second
  connectionDistance: number; // percentage of screen size
}>(), {
  numStars: 800,
});

const starsCanvasRef = useTemplateRef('starsCanvasRef');
const linesCanvasRef = useTemplateRef('linesCanvasRef');
const manualCanvasRef = useTemplateRef('manualCanvasRef');
const { width: windowWidth, height: windowHeight } = useWindowSize();
const { x: mouseX, y: mouseY } = useMouse();

const propsWaitingToRatio = ref<Partial<Record<PositionProps, PositionRatioChange>>>({});
const isWaitingForPropChanges = computed(() => !isEmpty(propsWaitingToRatio.value));

const canvasWidth = ref<string>();
const canvasHeight = ref<string>();
// keep canvas style in sync with actual width and height so it doesn't stretch while resizing the window
const canvasStyle = computed(() => ({
  width: canvasWidth.value,
  height: canvasHeight.value
}));

const stars = shallowRef<Star[]>([]);
const lines = shallowRef<Line[]>([]);

const maxLineDistance = computed(() => {
  const minSide = Math.min(windowWidth.value, windowHeight.value);
  return minSide * props.connectionDistance;
});

const generateStar = () => {
  const x = Math.random() * windowWidth.value;
  const y = Math.random() * windowHeight.value;
  const xSpeed = getRandomSpeed(props.maxXSpeed);
  const ySpeed = getRandomSpeed(props.maxYSpeed);
  return {
    x,
    y,
    xSpeed,
    ySpeed
  };
};

const moveStars = (deltaT: number) => {
  const newStars: Star[] = [];
  for(let i = 0; i < stars.value.length; i++) {
    const star = stars.value[i]!;

    let x = moveWithSpeed(star.x, star.xSpeed, deltaT);
    let y = moveWithSpeed(star.y, star.ySpeed, deltaT);
    let xSpeed = star.xSpeed;
    let ySpeed = star.ySpeed;

    if (x < 0 || x > windowWidth.value) {
      xSpeed = -star.xSpeed;
      x = moveWithSpeed(star.x, star.xSpeed, deltaT);
    }

    if (y < 0 || y > windowHeight.value) {
      ySpeed = -star.ySpeed;
      y = moveWithSpeed(star.y, star.ySpeed, deltaT);
    }

    newStars.push({
      x,
      y,
      xSpeed,
      ySpeed
    });
  }
  stars.value = newStars;
};

const computedLines = computed(() => {
  if (isWaitingForPropChanges.value) {
    // We don't use computedLines while waiting, so don't bother computing them
    return [];
  }
  const newLines: Line[] = [];
  const mouseStar: Star = { x: mouseX.value, y: mouseY.value, xSpeed: 0, ySpeed: 0 };

  // stars then mouseStar then manualStars
  const allStars = stars.value.concat([mouseStar].concat(props.manualSections.flatMap(s => s.stars)));

  // We don't want to compare the manual stars with other manual stars, so don't include them
  // in the outer loop. Only iterate over stars and the mouseStar
  for (let i = 0; i < stars.value.length + 1; i++) {
    // Can start j from i + 1 since we've already found all combinations with
    // earlier stars and we don't need to combine star i with itself.
    for (let j = i + 1; j < allStars.length; j++) {
      const s1 = allStars[i]!;
      const s2 = allStars[j]!;
      const distance = getDistance(s1.x, s2.x, s1.y, s2.y);

      if (distance < maxLineDistance.value) {
        newLines.push({
          x1: s1.x,
          x2: s2.x,
          y1: s1.y,
          y2: s2.y,
        });
      }
    }
  }
  return newLines;
});

// It's much more performant to calculate lines asynchronously in a computed than to do it
// synchronously within a requestAnimationFrame, but we don't want the lines updating
// during window resize events because the connection distance changes immediately but the
// star positions don't change until the window size is set for more than 200 ms. If we
// let lines change while these values are out of sync we may get issues like many more
// lines that appear between stars when a small window is changed to a large window, and
// then disapear again 200 ms later
watch([computedLines, isWaitingForPropChanges], () => {
  if (!isWaitingForPropChanges.value) {
    lines.value = computedLines.value;
  }
});

// Similarily, we don't want to change canvasWidth or canvasHeight while waiting for resize
// and related events. Resizing a canvas width or height causes the canvas to clear. If this
// happens during resize events it can make the canvas flicker because the clear is out of
// sync with the next scheduled animation frame
watch([windowWidth, isWaitingForPropChanges], () => {
  if (!isWaitingForPropChanges.value) {
    canvasWidth.value = `${windowWidth.value}px`;
  }
}, { immediate: true });
watch([windowHeight, isWaitingForPropChanges], () => {
  if (!isWaitingForPropChanges.value) {
    canvasHeight.value = `${windowHeight.value}px`;
  }
}, { immediate: true});

const drawCommonCanvas = (
  canvas: HTMLCanvasElement | null,
  drawFunction: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  gradientStartColor?: string,
  gradientEndColor?: string,
): boolean => {
  const ctx = canvas?.getContext('2d');
  const width = canvas?.width;
  const height = canvas?.height;
  if (!ctx || !width || !height) {
    return false;
  }

  ctx.clearRect(0, 0, width, height);

  drawFunction(ctx, width, height);

  if (gradientStartColor && gradientEndColor) {
    ctx.save();
    const gradient = makeRadialGradient(ctx,
      mouseX.value,
      mouseY.value,
      MOUSE_GRADIENT_START_RADIUS,
      MOUSE_GRADIENT_END_RADIUS,
      gradientStartColor,
      gradientEndColor
    );
    // Setting globalCompositeOperation to destination-out
    // makes the inverse of the gradient opacity apply to the
    // previous content. The transparent radius around the mouse
    // keeps the content in that radius untouched, the more opaque
    // outer edges make the content below become faded
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
  return true;
};

const drawStarsCanvas = () => {
  return drawCommonCanvas(
    starsCanvasRef.value,
    (ctx) => {
      stars.value.forEach(star => {
        drawCircle(ctx, star.x, star.y, STAR_RADIUS, STAR_FILL);
      });
      drawCircle(ctx, mouseX.value, mouseY.value, STAR_RADIUS, STAR_FILL);
    },
    STAR_MOUSE_GRADIENT_START_COLOR,
    STAR_MOUSE_GRADIENT_END_COLOR
  );
};

const drawLinesCanvas = () => {
  return drawCommonCanvas(
    linesCanvasRef.value,
    (ctx) => {
      lines.value.forEach(line => {
        drawLine(ctx, line.x1, line.x2, line.y1, line.y2, LINE_STROKE, LINE_WIDTH);
      });
    },
    LINE_MOUSE_GRADIENT_START_COLOR,
    LINE_MOUSE_GRADIENT_END_COLOR,
  );
};

const drawManualCanvas = () => {
  return drawCommonCanvas(
    manualCanvasRef.value,
    (ctx) => {
      props.manualSections.forEach(section => {
        section.stars.forEach(star => {
          drawCircle(ctx, star.x, star.y, MANUAL_STAR_RADIUS, STAR_FILL);
        });
        section.lines.forEach(line => {
          drawLine(ctx, line.x1, line.x2, line.y1, line.y2, LINE_STROKE, MANUAL_LINE_WIDTH);
        });
        section.text.forEach(text => {
          drawText(ctx, text.text, text.x, text.y);
        });
      });
    },
    MANUAL_MOUSE_GRADIENT_START_COLOR,
    MANUAL_MOUSE_GRADIENT_END_COLOR
  );
};

useTimer({
  minTimeBetweenFrames: computed(() => props.minTimeBetweenFrames),
  scheduledFunction: (t, lastT) => {
    if (!isWaitingForPropChanges.value) {
      const deltaT = isNil(lastT) ? t : t - lastT;
      moveStars(deltaT);
    }

    requestAnimationFrame(() => {
      drawStarsCanvas();
      drawLinesCanvas();
      drawManualCanvas();
    });
  },
});

// propsWaitingToRatio will often have many props added from changes around the same time,
// so debounce to do a single loop through stars per group of similarily timed changes.
// This also avoid the issue of the canvas flickering from many frequent small updates as a
// user changes the size of the window. This waits for the user to be done with a size change
// before triggering the udpates
const ratioStarProps = debounce(() => {
  const propsToRatio = filter(propsWaitingToRatio.value, (p) => !!p);
  propsWaitingToRatio.value = {};

  stars.value = ratioPositionProps(propsToRatio, stars.value);
}, 200);

onMounted(() => {
  watch(() => props.numStars, (newNum, oldNum) => {
    const newStars: Star[] = [...stars.value];
    if (!oldNum || newNum > oldNum) {
      for (let i = oldNum ?? 0; i < props.numStars; i++) {
        newStars.push(generateStar());
      }
    } else if (oldNum > newNum) {
      stars.value = newStars.slice(0, newNum);
    }
    stars.value = newStars;
  }, { immediate: true });

  watch([windowWidth, windowHeight, () => props.maxXSpeed, () => props.maxYSpeed], (
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

.stars-canvas, .lines-canvas, .manual-canvas {
  @apply absolute pointer-events-none;
}

.stars-canvas, .lines-canvas {
  @apply z-1 w-full h-full;
}

.manual-canvas {
  @apply z-3;
}
</style>
