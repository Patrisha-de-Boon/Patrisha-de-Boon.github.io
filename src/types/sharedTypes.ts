export const Sections = [ 'about', 'portfolio', 'resume', 'settings'] as const;
export type Section = typeof Sections[number];

export type Position = {
  x: number;
  y: number;
  xSpeed?: number;
  ySpeed?: number;
};

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CUT_CORNER_OFFSET = 8;
