"use client";

import { useState } from 'react';
import { useEffect } from 'react';
import type { SyncSessionFormData } from '@/lib/hooks/useSyncSessionForm';

interface AttendeeStepProps {
  formData: SyncSessionFormData;
  updateFormData: (data: Partial<SyncSessionFormData>) => void;
  nextStep: () => void;
}

export function AttendeeStep({ formData, updateFormData, nextStep }: AttendeeStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<{ id: string; name: string; purpose: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/harness-profiles/select', { cache: 'no-store' });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          selected?: { id: string } | null;
          items?: { id: string; name: string; purpose: string }[];
        };
        if (cancelled) return;
        setProfiles(payload.items ?? []);
        if (!formData.harness_profile_id && payload.selected?.id) {
          updateFormData({ harness_profile_id: payload.selected.id });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount for initial profile hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      nextStep();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="first_name"
          className="form-label"
        >
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          data-testid="name-input"
          value={formData.first_name}
          onChange={(e) => updateFormData({ first_name: e.target.value })}
          className="form-input"
          aria-invalid={!!errors.first_name}
          aria-describedby={errors.first_name ? 'first_name_error' : undefined}
        />
        {errors.first_name && (
          <p id="first_name_error" className="mt-1 text-sm text-[var(--brand-error)]" role="alert">{errors.first_name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="last_name"
          className="form-label"
        >
          Last Name (Optional)
        </label>
        <input
          type="text"
          id="last_name"
          value={formData.last_name || ''}
          onChange={(e) => updateFormData({ last_name: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="form-label"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          data-testid="email-input"
          value={formData.email || ''}
          onChange={(e) => updateFormData({ email: e.target.value })}
          disabled={formData.is_anonymous}
          placeholder="Email (optional)"
          className="form-input disabled:bg-[var(--atlas-surface-muted)] placeholder-gray-400"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_anonymous"
          data-testid="anonymous-checkbox"
          checked={formData.is_anonymous}
          onChange={(e) => updateFormData({ is_anonymous: e.target.checked })}
          className="h-4 w-4 rounded border-[var(--brand-secondary-text)] text-[var(--brand-electric-blue)] focus:ring-[var(--brand-electric-blue)]"
        />
        <label
          htmlFor="is_anonymous"
          className="ml-2 block text-sm text-[var(--brand-body-text)]"
        >
          Submit anonymously
        </label>
      </div>

      <div>
        <label htmlFor="harness_profile_id" className="form-label">
          Harness Profile
        </label>
        <select
          id="harness_profile_id"
          value={formData.harness_profile_id ?? ''}
          onChange={(e) => updateFormData({ harness_profile_id: e.target.value || undefined })}
          className="form-input"
        >
          <option value="">Select a profile</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-[var(--brand-secondary-text)]">
          Sets question strategy and output behavior hints for connected external harnesses.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          data-testid="next-button"
        >
          Next
        </button>
      </div>
    </form>
  );
} 
