import type { Transition, Variants } from "framer-motion";

export const homeEase = [0.22, 1, 0.36, 1] as const;

export const homeFadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export const homeFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function homeStagger(delay = 0.06): Transition {
  return {
    duration: 0.55,
    ease: homeEase,
    delay,
  };
}

export const homeViewport = { once: true, margin: "-12% 0px" as const };
