import { timer, type Timer } from "d3-timer";
import { isNil } from "lodash-es";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export type UseTimerArgs = {
  minTimeBetweenFrames: Ref<number>;
  scheduledFunction: (t: number, lastT: number | null) => void;
};

export type UseTimerReturn = {
  stop: () => void;
  restart: () => void;
};

export default function useTimer({
  minTimeBetweenFrames,
  scheduledFunction
}: UseTimerArgs): UseTimerReturn {
  const timerRef = ref<Timer | null>(null);
  const lastAnimationTime = ref<number | null>(null);

  const timerFunction = (t: number) => {
    if (isNil(lastAnimationTime.value) || t > lastAnimationTime.value + minTimeBetweenFrames.value) {
      if (scheduledFunction) {
        scheduledFunction(t, lastAnimationTime.value);
      }
      lastAnimationTime.value = t;
    }
  };

  onMounted(() => {
    // initaite a d3 timer to control animation. Note that props.framesPerSecond represents the
    // maximum frames per second, but timer could be called less frequently depending on
    // the user's computer and what else is running at the time.
    timerRef.value = timer(timerFunction);
  });

  onBeforeUnmount(() => {
    timerRef.value?.stop();
  });

  const stop = () => {
    timerRef.value?.stop();
  };

  const restart = () => {
    timerRef.value?.restart(timerFunction);
  };

  return {
    stop,
    restart,
  };
}
