-- Rename legacy column to neutral name (idempotent for fresh DBs that already use tenure_years).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'survey_responses'
      AND column_name = 'years_at_medtronic'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'survey_responses'
      AND column_name = 'tenure_years'
  ) THEN
    ALTER TABLE public.survey_responses
      RENAME COLUMN years_at_medtronic TO tenure_years;
  END IF;
END $$;
