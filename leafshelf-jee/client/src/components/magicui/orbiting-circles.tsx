import React from 'react';
import { cn } from '../../lib/utils';

export interface OrbitingCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  radius?: number;
  path?: boolean;
  iconSize?: number;
  speed?: number;
}

export function OrbitingCircles({
  className, children, reverse, duration = 20, radius = 160,
  path = true, iconSize = 30, speed = 1, ...props
}: OrbitingCirclesProps) {
  const calcDuration = duration / speed;
  const count = React.Children.count(children);

  return (
    <>
      {path && (
        <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute inset-0 w-full h-full">
          <circle cx="50%" cy="50%" r={radius} fill="none" className="stroke-white/10 stroke-1" />
        </svg>
      )}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / count) * index;
        return (
          <div
            style={{
              '--duration': calcDuration,
              '--radius': radius,
              '--angle': angle,
              width: iconSize,
              height: iconSize,
              animationDuration: `${calcDuration}s`,
              animationDirection: reverse ? 'reverse' : 'normal',
              transform: `rotate(${angle}deg) translateY(${radius}px) rotate(${-angle}deg)`,
            } as React.CSSProperties}
            className={cn(
              'absolute flex items-center justify-center rounded-full animate-orbit',
              className
            )}
            {...props}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}
