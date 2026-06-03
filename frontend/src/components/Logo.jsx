import { useId } from 'react';

export default function Logo({ size = 36, className = '' }) {
  const gradId = useId();

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      <path
        d="M12 28V12h6.2c3.4 0 5.6 1.8 5.6 4.6 0 2.1-1.2 3.5-3 4l4.2 7.4h-3.9l-3.6-6.4H15.2V28H12zm3.2-9.2h2.8c1.6 0 2.5-.8 2.5-2.1s-.9-2.1-2.5-2.1h-2.8v4.2z"
        fill="#fafafa"
      />
      <defs>
        <linearGradient id={gradId} x1="8" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c026d3" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
