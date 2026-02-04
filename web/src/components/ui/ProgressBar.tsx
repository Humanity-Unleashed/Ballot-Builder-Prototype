interface ProgressBarProps {
  /** Progress value between 0 and 100 */
  progress: number;
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Custom color class for the progress fill (default: bg-blue-500) */
  color?: string;
}

export default function ProgressBar({
  progress,
  className = '',
  color = 'bg-blue-500',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${color}`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
