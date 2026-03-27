import { useState } from 'react';
import type { SurveyFormData } from './types';

export type { SurveyFormData } from './types';

function buildSurveyPostBody(formData: SurveyFormData) {
  const lastName = formData.last_name?.trim() || '—';
  const answers = [
    { questionId: 'tenure_years', answer: String(formData.tenure_years ?? 0) },
    { questionId: 'learning_style', answer: formData.learning_style ?? '' },
    { questionId: 'shaped_by', answer: formData.shaped_by ?? '' },
    { questionId: 'peak_performance', answer: formData.peak_performance ?? '' },
    { questionId: 'motivation', answer: formData.motivation ?? '' },
    { questionId: 'unique_quality', answer: formData.unique_quality ?? '' },
  ];
  return {
    firstName: formData.first_name,
    lastName,
    email: formData.is_anonymous ? '' : formData.email ?? '',
    isAnonymous: formData.is_anonymous,
    answers,
  };
}

export function useSurveyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SurveyFormData>({
    first_name: '',
    is_anonymous: false,
  });

  const updateFormData = (data: Partial<SurveyFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildSurveyPostBody(formData)),
      });

      const payload = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        issues?: unknown;
      };

      if (!res.ok) {
        if (res.status === 409 && payload.message) {
          setError(payload.message);
        } else if (payload.message) {
          setError(payload.message);
        } else if (payload.error === 'Validation failed') {
          setError('Please check your answers and try again.');
        } else {
          setError('An error occurred while submitting the form');
        }
        return;
      }

      nextStep();
    } catch (err) {
      console.error('Survey submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  };
}
