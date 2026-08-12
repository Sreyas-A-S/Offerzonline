"use client";

import Lottie from "lottie-react";

// Lightweight Lottie Animation Data for Empty Search / Location Pulse
const pulseAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 45, s: [0] },
            { t: 60, s: [0] }
          ]
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [30, 30, 100] },
            { t: 45, s: [100, 100, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [80, 80] }
        },
        {
          ty: "st",
          c: { a: 0, k: [0.388, 0.4, 0.945, 1] },
          w: { a: 0, k: 6 }
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Center Dot",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [24, 24] }
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.388, 0.4, 0.945, 1] }
        }
      ]
    }
  ]
};

const emptyStateAnimationData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 120,
  h: 120,
  nm: "Radar",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Radar Sweep",
      sr: 1,
      ks: {
        o: { a: 0, k: 60 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 90, s: [360] }
          ]
        },
        p: { a: 0, k: [60, 60, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [90, 90] }
        },
        {
          ty: "st",
          c: { a: 0, k: [0.65, 0.55, 0.98, 1] },
          w: { a: 0, k: 4 }
        }
      ]
    }
  ]
};

interface LottieAnimationProps {
  type?: "pulse" | "radar";
  className?: string;
}

export function LottieAnimation({ type = "pulse", className = "w-12 h-12" }: LottieAnimationProps) {
  const data = type === "radar" ? emptyStateAnimationData : pulseAnimationData;
  return (
    <div className={className}>
      <Lottie animationData={data} loop={true} />
    </div>
  );
}
