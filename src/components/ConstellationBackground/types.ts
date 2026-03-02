import type { Position } from "@/shared/sharedTypes";

export type Star = Position;

export type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Text = {
  text: string;
  x: number;
  y: number;
};

export type ManualSection = {
  stars: Star[];
  lines: Line[];
  text: Text[];
};
