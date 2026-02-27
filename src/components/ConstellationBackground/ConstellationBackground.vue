<template>
  <canvas
    ref="linesCanvasRef"
    class="lines-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
  />
  <canvas
    ref="starsCanvasRef"
    class="stars-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
  />
  <canvas
    ref="manualCanvasRef"
    class="manual-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
  />
</template>

<script setup lang="ts">
import { useMouse, useWindowSize } from '@vueuse/core';
import { useTemplateRef, ref, watch, computed, onMounted, shallowRef } from 'vue';
import { drawCircle, drawLine, getDistance, makeRadialGradient } from './utils';
import { LINE_STROKE, MAX_LINE_DISTANCE, LINE_MOUSE_GRADIENT_END_COLOR,
  MOUSE_GRADIENT_END_RADIUS, STAR_MOUSE_GRADIENT_END_COLOR, STAR_MOUSE_GRADIENT_START_COLOR,
  LINE_MOUSE_GRADIENT_START_COLOR, MOUSE_GRADIENT_START_RADIUS, STAR_FILL, STAR_RADIUS,
  MANUAL_STAR_RADIUS,
  MANUAL_LINE_WIDTH,
  LINE_WIDTH,
  MANUAL_MOUSE_GRADIENT_END_COLOR,
  MANUAL_MOUSE_GRADIENT_START_COLOR
} from './constants';
import type { Line, Star } from './types';
import useTimer from '@/composables/useTimer';

const props = withDefaults(defineProps<{
  manualStars: Star[];
  manualLines: Line[];
  numStars?: number;
  minTimeBetweenFrames: number;
}>(), {
  numStars: 800,
});

const starsCanvasRef = useTemplateRef('starsCanvasRef');
const linesCanvasRef = useTemplateRef('linesCanvasRef');
const manualCanvasRef = useTemplateRef('manualCanvasRef');
const { width: windowWidth, height: windowHeight } = useWindowSize();
const { x: mouseX, y: mouseY } = useMouse();

const shouldDrawManualCanvas = ref(true);

const canvasWidth = computed(() => `${windowWidth.value}px`);
const canvasHeight = computed(() => `${windowHeight.value}px`);

const stars = shallowRef<Star[]>([]);

const maxLineDistance = computed(() => {
  const minSide = Math.min(windowWidth.value, windowHeight.value);
  return minSide * MAX_LINE_DISTANCE;
});

const generateStar = () => {
  const x = Math.random() * windowWidth.value;
  const y = Math.random() * windowHeight.value;
  // Speed should be relative to the screen size so it takes the same amount of time
  // for a star to move across the window on any screen size.
  // Through experimentation this felt the best over the largest number of screens.
  const speedDivisor = 2000;
  const xSpeed = (Math.random() - 0.5) / speedDivisor * windowWidth.value;
  const ySpeed = (Math.random() - 0.5) / speedDivisor * windowHeight.value;
  return {
    x,
    y,
    xSpeed,
    ySpeed
  };
};

const moveStars = () => {
  const newStars: Star[] = [];
  for(let i = 0; i < stars.value.length; i++) {
    const star = stars.value[i]!;

    let x = star.x + star.xSpeed;
    let y = star.y + star.ySpeed;
    let xSpeed = star.xSpeed;
    let ySpeed = star.ySpeed;

    if (x < 0 || x > windowWidth.value) {
      xSpeed = -star.xSpeed;
      x = star.x + xSpeed;
    }

    if (y < 0 || y > windowHeight.value) {
      ySpeed = -star.ySpeed;
      y = star.y + ySpeed;
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

const lines = computed(() => {
  const newLines: Line[] = [];
  const mouseStar: Star = { x: mouseX.value, y: mouseY.value, xSpeed: 0, ySpeed: 0 };

  // stars then mouseStar then manualStars
  const allStars = stars.value.concat([mouseStar].concat(props.manualStars));

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
      props.manualStars.forEach(star => {
        drawCircle(ctx, star.x, star.y, MANUAL_STAR_RADIUS, STAR_FILL);
      });
      props.manualLines.forEach(line => {
        drawLine(ctx, line.x1, line.x2, line.y1, line.y2, LINE_STROKE, MANUAL_LINE_WIDTH);
      });
    },
    MANUAL_MOUSE_GRADIENT_START_COLOR,
    MANUAL_MOUSE_GRADIENT_END_COLOR
  );
};

useTimer({
  minTimeBetweenFrames: computed(() => props.minTimeBetweenFrames),
  scheduledFunction: () => {
    moveStars();

    requestAnimationFrame(() => {
      drawStarsCanvas();
      drawLinesCanvas();
      drawManualCanvas();
    });
  },
});

onMounted(() => {
  watch([() => props.manualLines, () => props.manualStars], () => {
    shouldDrawManualCanvas.value = true;
  }, { immediate: true });

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

  watch([windowWidth, windowHeight], ([newWidth, newHeight], [oldWidth, oldHeight]) => {
    if (!oldWidth || !oldHeight || !newWidth || !newHeight) {
      return;
    }

    const newStars: Star[] = [];

    const widthRatio = newWidth / oldWidth;
    const heightRatio = newHeight / oldHeight;
    stars.value.forEach((star) => {
      const newStar = {
        ...star
      };

      if (newWidth !== oldWidth) {
        newStar.x = star.x * widthRatio;
        newStar.xSpeed = star.xSpeed * widthRatio;
      }

      if (newHeight !== oldHeight) {
        newStar.y = star.y * heightRatio;
        newStar.ySpeed = star.ySpeed * heightRatio;
      }

      newStars.push(newStar);
    });
    stars.value = newStars;
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
