'use client';

export function SyncStepNav({
  onPrev,
  submitLabel = 'Next',
  isSubmitting = false,
  testId = 'next-button',
}: {
  onPrev: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  testId?: string;
}) {
  return (
    <div className="flex justify-between">
      <button type="button" onClick={onPrev} className="sync-btn-secondary" data-testid="prev-button">
        Previous
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="sync-btn-primary"
        data-testid={testId}
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
    </div>
  );
}
