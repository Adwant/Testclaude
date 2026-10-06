import { motion, useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';

import sneaker from '../assets/3d/sneaker.webp';
import calendar from '../assets/3d/calendar.webp';
import gift from '../assets/3d/gift.webp';
import target from '../assets/3d/target.webp';
import hourglass from '../assets/3d/hourglass.webp';
import tape from '../assets/3d/tape.webp';
import kettlebell from '../assets/3d/kettlebell.webp';
import dumbbell from '../assets/3d/dumbbell.webp';
import stopwatch from '../assets/3d/stopwatch.webp';
import lock from '../assets/3d/lock.webp';
import trophy from '../assets/3d/trophy.webp';
import flag from '../assets/3d/flag.webp';
import check from '../assets/3d/check.webp';
import spiral from '../assets/3d/spiral.webp';
import watch from '../assets/3d/watch.webp';
import boltGold from '../assets/3d/bolt-gold.webp';
import crystal from '../assets/3d/crystal.webp';
import bottle from '../assets/3d/bottle.webp';
import boltOrange from '../assets/3d/bolt-orange.webp';
import box from '../assets/3d/box.webp';
import clipboard from '../assets/3d/clipboard.webp';
import medal from '../assets/3d/medal.webp';
import blocks from '../assets/3d/blocks.webp';
import road from '../assets/3d/road.webp';

export const IMG = {
  sneaker,
  calendar,
  gift,
  target,
  hourglass,
  tape,
  kettlebell,
  dumbbell,
  stopwatch,
  lock,
  trophy,
  flag,
  check,
  spiral,
  watch,
  boltGold,
  crystal,
  bottle,
  boltOrange,
  box,
  clipboard,
  medal,
  blocks,
  road,
};
export type ImgName = keyof typeof IMG;

interface Props {
  name: ImgName;
  size: number;
  /** Мягкое «парение» объекта. */
  float?: boolean;
  /** Появление с пружиной. */
  pop?: boolean;
  /** Постоянный лёгкий поворот (как в макете, rotate-8). */
  rotate?: number;
  delay?: number;
  spin?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** 3D-иллюстрация из серий A′/B/E/F/G/H. Прозрачный PNG → WebP. */
export function Img3D({ name, size, float, pop = true, rotate = 0, delay = 0, spin, className, style }: Props) {
  const reduce = useReducedMotion();
  const animateFloat = float && !reduce;
  return (
    <motion.div
      className={['img3d', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
      initial={pop && !reduce ? { opacity: 0, scale: 0.7, rotate: rotate - 10, y: 10 } : false}
      animate={{ opacity: 1, scale: 1, rotate, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay }}
    >
      <motion.img
        src={IMG[name]}
        alt=""
        draggable={false}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        animate={
          spin && !reduce
            ? { rotate: [0, 360] }
            : animateFloat
              ? { y: [0, -size * 0.035, 0], rotate: [0, 1.5, 0] }
              : undefined
        }
        transition={
          spin
            ? { duration: 2.4, repeat: Infinity, ease: 'linear' }
            : { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }
        }
      />
    </motion.div>
  );
}
