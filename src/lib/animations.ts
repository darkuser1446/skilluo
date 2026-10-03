import { Variants, Transition } from "framer-motion";

// Smooth physics transitions
export const smoothTransition: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1], // Cubic-bezier from modern pro-max specs
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 14,
};

// 1. Basic Fade Animations with Directional Movement
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothTransition,
  },
};

// 2. Stagger Containers for Sequential Child Reveals
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// 3. Hover and Tap Micro-Interactions
export const hoverScale = {
  scale: 1.03,
  transition: { duration: 0.2, ease: "easeOut" },
};

export const tapScale = {
  scale: 0.97,
  transition: { duration: 0.1, ease: "easeOut" },
};

export const hoverLift = {
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" },
};

// 4. Subtle Ambient Floating
export const floatingVariant: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
