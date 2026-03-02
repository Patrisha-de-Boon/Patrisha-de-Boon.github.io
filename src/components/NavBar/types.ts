import type { Section } from "@/shared/sharedTypes";

export type NavLink = {
  id: Section;
  label: string;
  title?: string;
};
