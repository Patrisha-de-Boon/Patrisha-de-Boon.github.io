<template>
  <RouterView />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { CUT_CORNER_OFFSET } from './types/sharedTypes';

const cutCornerOffsetPx = computed(() => `${CUT_CORNER_OFFSET}px`);
</script>

<style>
@reference "#main.css";

/* cut-corners class is based on the method described by Kevin Powell in https://www.youtube.com/watch?v=aW6qEAQSctY */
.cut-corners,
.cut-corners-top {
  --cut-corner-size: v-bind(cutCornerOffsetPx);
  --cut-corner-border: transparent;
  --cut-corner-background: var(--color-gray-900);
  --cut-corner-border-width: 1px;

  @apply relative isolate z-1;
  background: var(--cut-corner-background);

  &::before,
  &::after {
    @apply absolute inset-0;
    content: '';
  }

  &::before {
    @apply -z-2;
    background: var(--cut-corner-border);
  }

  &::after {
    @apply bg-inherit -z-1;
  }
}

.cut-corners {
  /* Clip path comment labels are primary edge followed by side of edge */
  clip-path: polygon(
    /* top left */
    var(--cut-corner-size) 0%,
    /* top right */
    calc(100% - var(--cut-corner-size)) 0%,
    /* right top */
    100% var(--cut-corner-size),
    /* right bottom */
    100% calc(100% - var(--cut-corner-size)),
    /* bottom right */
    calc(100% - var(--cut-corner-size)) 100%,
    /* bottom left */
    var(--cut-corner-size) 100%,
    /* left bottom */
    0% calc(100% - var(--cut-corner-size)),
    /* left top */
    0% var(--cut-corner-size)
  );

  &::after {
    clip-path: polygon(
      /* top left */
      calc(var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)
      var(--cut-corner-border-width),
      /* top right */
      calc(100% - var(--cut-corner-border-width) - (var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5))
      var(--cut-corner-border-width),
      /* right top */
      calc(100% - var(--cut-corner-border-width))
      var(--cut-corner-size),
      /* right bottom */
      calc(100% - var(--cut-corner-border-width))
      calc(100% - (var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)),
      /* bottom right */
      calc(100% - var(--cut-corner-border-width) - (var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5))
      calc(100% - var(--cut-corner-border-width)),
      /* bottom left */
      calc(var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)
      calc(100% - var(--cut-corner-border-width)),
      /* left bottom */
      var(--cut-corner-border-width)
      calc(100% - var(--cut-corner-border-width) - (var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)),
      /* left top */
      var(--cut-corner-border-width)
      calc(var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)
    );
  }

  .cut-corners-top {
    clip-path: polygon(
      /* top left */
      var(--cut-corner-size) 0%,
      /* top right */
      calc(100% - var(--cut-corner-size)) 0%,
      /* right top */
      100% var(--cut-corner-size),
      /* bottom right */
      100% 100%,
      /* bottom left */
      0% 100%,
      /* left top */
      0% var(--cut-corner-size)
    );

    &::after {
      clip-path: polygon(
        /* top left */
        calc(var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)
        var(--cut-corner-border-width),
        /* top right */
        calc(100% - var(--cut-corner-border-width) - (var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5))
        var(--cut-corner-border-width),
        /* right top */
        calc(100% - var(--cut-corner-border-width))
        var(--cut-corner-size),
        /* bottom right */
        calc(100% - var(--cut-corner-border-width))
        calc(100% - var(--cut-corner-border-width)),
        /* bottom left */
        var(--cut-corner-border-width)
        calc(100% - var(--cut-corner-border-width)),
        /* left top */
        var(--cut-corner-border-width)
        calc(var(--cut-corner-size) + var(--cut-corner-border-width) * 0.5)
      );
    }
  }
}
</style>
