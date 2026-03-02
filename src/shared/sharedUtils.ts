import { isNil } from "lodash-es";
import type { Position, PositionProps, PositionRatioChange } from "./sharedTypes";
import type { Ref } from "vue";

export const CUT_CORNER_OFFSET = 8;
export const DEFAULT_FRAMES_PER_SECOND = 30;
export const DEFAULT_MIN_TIME_TO_CROSS_SCREEN = 120;
export const DEFAULT_CONNECTION_DISTANCE = 0.05;

export const getRandomSpeed = (maxSpeed: number): number => {
  // random number between -1 and 1
  const randomMultiplier = (Math.random() * 2) - 1;
  return maxSpeed * randomMultiplier;
};

// returns the new distance value
export const moveWithSpeed = (
  distance: number, // pixels from origin
  speed: number, // pixels per second
  deltaT: number, // number of miliseconds since last move
): number => {
  const deltaDistance = speed * (deltaT / 1000);
  return distance + deltaDistance;
};

// Use propsToRatio to determine which props in each position object should
// be changed, and multiply them by the ratio of newValue / oldValue.
export const ratioPositionProps = <T extends Position>(
  propsToRatio: PositionRatioChange[],
  positions: T[]
): T[] => {
  const newPositions: T[] = [];

  const ratios = propsToRatio.map(p => {
    if (isNil(p.oldValue) || isNil(p.newValue) || p.oldValue === p.newValue) {
      return null;
    }
    return p.newValue / p.oldValue;
  });
  positions.forEach((star) => {
    const newPosition: T = {
      ...star
    };

    propsToRatio.forEach((p, i) => {
      if (!isNil(ratios[i])) {
        newPosition[p.prop] = star[p.prop] * ratios[i];
      }
    });

    newPositions.push(newPosition);
  });

  return newPositions;
};

// Add any values that have changed to the waiting ref, or update the newValue
// if a prop have been changed before and is still waiting for those changes to apply
export const updateWaitingPropsToRatio = (
  waiting: Ref<Partial<Record<PositionProps, PositionRatioChange>>>,
  newValues: [number, number, number, number],
  oldValues: [number | undefined, number | undefined, number | undefined, number | undefined]
): void => {
  const [newWidth, newHeight, newMaxXSpeed, newMaxYSpeed] = newValues;
  const [oldWidth, oldHeight, oldMaxXSpeed, oldMaxYSpeed] = oldValues;

  const propsToRatio: PositionRatioChange[] = [
    { prop: 'x', newValue: newWidth, oldValue: oldWidth ?? newWidth },
    { prop: 'y', newValue: newHeight, oldValue: oldHeight ?? newHeight },
    { prop: 'xSpeed', newValue: newMaxXSpeed, oldValue: oldMaxXSpeed ?? newMaxXSpeed},
    { prop: 'ySpeed', newValue: newMaxYSpeed, oldValue: oldMaxYSpeed ?? newMaxYSpeed },
  ];

  propsToRatio.forEach(p => {
    if (!isNil(p.oldValue) && !isNil(p.newValue) && p.newValue !== p.oldValue) {
      const waitingProp = waiting.value[p.prop];
      waiting.value[p.prop] = waitingProp
        ? { ...waitingProp, newValue: p.newValue }
        : p;
    }
  });
};
