import React, { useState, useEffect, useRef } from 'react';

/**
 * EyeLogo
 * - animated: idle random drift
 * - trackCursor: when cursor is within ~1/6 of viewport from the eye,
 *   the pupil follows the cursor; otherwise it drifts idly.
 */
function EyeLogo({ size = 28, className = "", animated = false, trackCursor = false }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const timeoutRef = useRef(null);      // drift timer
  const svgRef = useRef(null);          // for position
  const rafRef = useRef(null);          // animation frame for follow
  const lastPosRef = useRef(null);      // last cursor position
  const isFollowingRef = useRef(false); // follow mode flag

  const maxOffset = 6; // px

  function clearDrift() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function scheduleDrift() {
    if (!animated || isFollowingRef.current) return;
    clearDrift();

    const delayMs = 1200 + Math.random() * 1600; // 1.2s to 2.8s
    timeoutRef.current = setTimeout(() => {
      const goCenter = Math.random() < 0.3;
      if (goCenter) {
        setOffset({ x: 0, y: 0 });
      } else {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 1 + Math.random() * 4;
        setOffset({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
      }
      scheduleDrift();
    }, delayMs);
  }

  // Idle drift
  useEffect(() => {
    scheduleDrift();
    return clearDrift;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  // Cursor tracking for interactive eyes
  useEffect(() => {
    if (!trackCursor) return;

    function handleMove(e) {
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateFollow);
      }
    }

    function updateFollow() {
      rafRef.current = null;
      if (!svgRef.current || !lastPosRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = lastPosRef.current.x - centerX;
      const dy = lastPosRef.current.y - centerY;
      const dist = Math.hypot(dx, dy);

      const threshold = Math.min(window.innerWidth, window.innerHeight) / 6;

      if (dist < threshold) {
        if (!isFollowingRef.current) {
          isFollowingRef.current = true;
          clearDrift();
        }
        const scaled = dist === 0 ? 0 : Math.min(dist, threshold) / threshold;
        const scale = scaled * maxOffset / (dist || 1);
        setOffset({
          x: dx * scale,
          y: dy * scale
        });
      } else if (isFollowingRef.current) {
        isFollowingRef.current = false;
        scheduleDrift();
      }
    }

    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackCursor, animated]);

  const isFollowing = isFollowingRef.current;

  return (
    <svg
      ref={svgRef}
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

      {/* pupil */}
      <g
        style={{
          transition: isFollowing ? 'transform 0.06s ease-out' : 'transform 0.4s ease-out',
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        <circle cx="32" cy="32" r="8" fill="currentColor" />
      </g>
    </svg>
  );
}

export default EyeLogo;
