import type { ClarificationQuestionSpec } from '@/lib/clarification/schemas';
import type { ClarificationResolution } from '@/lib/clarification/schemas';

function optionIdSet(spec: ClarificationQuestionSpec): Set<string> {
  if (spec.kind === 'single_choice' || spec.kind === 'multi_choice') {
    return new Set(spec.options.map((o) => o.id));
  }
  return new Set();
}

/**
 * Returns an error message if resolution does not satisfy the question spec, else null.
 */
export function validateResolutionAgainstSpec(
  spec: ClarificationQuestionSpec,
  resolution: ClarificationResolution
): string | null {
  const { selectedOptionIds, freeText, likertValue } = resolution;

  switch (spec.kind) {
    case 'single_choice': {
      const ids = selectedOptionIds ?? [];
      const hasText = typeof freeText === 'string' && freeText.trim().length > 0;
      if (ids.length === 0 && !hasText) {
        return 'Select an option or provide free text when allowed.';
      }
      if (ids.length > 1) {
        return 'single_choice allows at most one selected option.';
      }
      if (ids.length === 1) {
        const set = optionIdSet(spec);
        if (!set.has(ids[0])) {
          return 'Selected option id is not valid for this question.';
        }
      }
      if (hasText && !spec.allowFreeText) {
        return 'Free text is not allowed for this question.';
      }
      if (ids.length === 0 && hasText && !spec.allowFreeText) {
        return 'Free text is not allowed for this question.';
      }
      return null;
    }
    case 'multi_choice': {
      const ids = selectedOptionIds ?? [];
      if (ids.length < 1) {
        return 'Select at least one option.';
      }
      const set = optionIdSet(spec);
      for (const id of ids) {
        if (!set.has(id)) {
          return 'One or more selected option ids are invalid.';
        }
      }
      return null;
    }
    case 'text': {
      const t = typeof freeText === 'string' ? freeText.trim() : '';
      if (t.length === 0) {
        return 'Provide a text answer.';
      }
      return null;
    }
    case 'likert': {
      if (likertValue === undefined || Number.isNaN(likertValue)) {
        return 'Provide a likert value.';
      }
      const min = spec.min ?? 1;
      const max = spec.max ?? 5;
      if (likertValue < min || likertValue > max) {
        return `Likert value must be between ${min} and ${max}.`;
      }
      return null;
    }
    default:
      return 'Unknown question kind.';
  }
}
