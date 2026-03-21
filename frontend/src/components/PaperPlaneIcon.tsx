interface PaperPlaneIconProps {
  size?: number;
  className?: string;
}

export default function PaperPlaneIcon({ size = 64, className = "" }: PaperPlaneIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21.8 2.2L2.9 9.8c-.9.4-.8 1.7.1 1.9l6.7 1.7 1.7 6.7c.2.9 1.5 1 1.9.1l7.6-18.9c.4-1-.6-2-1.6-1.6z"
        fill="currentColor"
      />
    </svg>
  );
}
