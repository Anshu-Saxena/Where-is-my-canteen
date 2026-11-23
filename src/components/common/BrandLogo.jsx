import React from 'react';

export default function BrandLogo({ className = 'w-9 h-9' }) {
  return (
    <img
      src="/where-is-my-canteen-logo.svg"
      alt=""
      aria-hidden="true"
      className={`object-contain ${className}`}
    />
  );
}
