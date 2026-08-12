// Bespoke mark for TCHBAE (That Could Have Been An Email): an envelope with
// a checkmark, drawn in the same stroke style as the lucide-react icon set
// so it sits alongside them without looking out of place.
export function TchbaeLogo({ size = 24, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="m3 7 8.4 6.3a2 2 0 0 0 2.4 0L22 7" />
      <path d="m14.5 16 2 2 4-4" />
    </svg>
  );
}
