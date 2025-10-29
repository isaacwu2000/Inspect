import React, { useState, useEffect, useRef } from 'react';

function EyeLogo({ size = 28, className = "", animated = false }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!animated) return;

    function scheduleNextMove() {

      const delayMs = 1000 + Math.random() * 1000; //between 2 and 5 seconds

      timeoutRef.current = setTimeout(() => {

        const goCenter = Math.random() < 0.3; //30% chance to reset

        if (goCenter) {
          setOffset({ x: 0, y: 0 });
        } else {
          //random angle + radius
          const angle = Math.random() * 2 * Math.PI;
          const radius = 1 + Math.random() * 4; //1px to 5px-ish
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          setOffset({ x, y });
        }

        //schedule again
        scheduleNextMove();
      }, delayMs);
    }

    scheduleNextMove();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [animated]);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        display: 'block',
        color: 'currentColor',
        pointerEvents: 'none',
      }}
    >
      {/* outer eye shape */}
      <path d="M4 32C10 20 22 12 32 12s22 8 28 20c-6 12-18 20-28 20S10 44 4 32z" />

      {/*pupil*/}
      <g
        style={{
          transition: 'transform 0.4s ease-out',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <circle cx="32" cy="32" r="8" fill="currentColor" />
      </g>
    </svg>
  );
}

export default EyeLogo;