import { applyAlpha } from "./utils";

export const STAR_FILL = 'white';
export const LINE_STROKE = 'white';

export const GRADIENT_COLOR = 'white';
// Lines should be mostly invisible at the end of the gradient and much brighter at the start
export const LINE_MOUSE_GRADIENT_START_COLOR = applyAlpha(GRADIENT_COLOR, 0);
export const LINE_MOUSE_GRADIENT_END_COLOR = applyAlpha(GRADIENT_COLOR, 0.9);
// Stars should be mostly visible at the end of the gradient and just a little bit brighter at the start
export const STAR_MOUSE_GRADIENT_START_COLOR = applyAlpha(GRADIENT_COLOR, 0);
export const STAR_MOUSE_GRADIENT_END_COLOR = applyAlpha(GRADIENT_COLOR, 0.2);
// Manual placed items should be somewhere in the middle.
export const MANUAL_MOUSE_GRADIENT_START_COLOR = applyAlpha(GRADIENT_COLOR, 0);
export const MANUAL_MOUSE_GRADIENT_END_COLOR = applyAlpha(GRADIENT_COLOR, 0.6);

// These values are in pixels
export const STAR_RADIUS = 1;
export const MANUAL_STAR_RADIUS = 2;
export const LINE_WIDTH = 1;
export const MANUAL_LINE_WIDTH = 2;
export const MOUSE_GRADIENT_START_RADIUS = 0;
export const MOUSE_GRADIENT_END_RADIUS = 200;
