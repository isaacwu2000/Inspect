import React from 'react';

function EyeLogo({ size = 28, className = "" }) {
  //I re-did this to make it actually look good and work
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
    >
      {/*outer eye shape*/}
      <path d="M4 32C10 20 22 12 32 12s22 8 28 20c-6 12-18 20-28 20S10 44 4 32z" />
      {/*the other thingy*/}
      <circle cx="32" cy="32" r="8" fill="currentColor" />
    </svg>
  );
}

export default EyeLogo;
