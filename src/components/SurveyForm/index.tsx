"use client";

import { useSurveyForm } from '@/lib/hooks/useSurveyForm';
import { AttendeeStep } from './steps/AttendeeStep';
import { YearsStep } from './steps/YearsStep';
import { LearningStyleStep } from './steps/LearningStyleStep';
import { ShapedByStep } from './steps/ShapedByStep';
import { PeakPerformanceStep } from './steps/PeakPerformanceStep';
import { MotivationStep } from './steps/MotivationStep';
import { UniqueQualityStep } from './steps/UniqueQualityStep';
import { SuccessStep } from './steps/SuccessStep';
import '@/styles/brand.css';

const steps = [
  AttendeeStep,
  YearsStep,
  LearningStyleStep,
  ShapedByStep,
  PeakPerformanceStep,
  MotivationStep,
  UniqueQualityStep,
  SuccessStep,
];

export function SurveyForm() {
  const {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  } = useSurveyForm();

  const CurrentStepComponent = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--brand-atmospheric-white)]" data-testid="survey-form-container">
      <div className="max-w-xl w-full mx-auto px-0 pt-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand-navy-blue)] mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            Operator intake
          </h1>
          <p className="text-[var(--brand-secondary-text)] text-sm mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            Legacy portfolio sample (anonymized event-style flow). Use for demos; not medical or clinical use.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="form-container" data-testid="survey-form-steps">
          {error && (
            <div className="message message-error">
              {error}
            </div>
          )}

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            submitForm={submitForm}
            isSubmitting={isSubmitting}
            isLastStep={currentStep === steps.length - 2}
          />
        </div>
      </div>
    </div>
  );
} 