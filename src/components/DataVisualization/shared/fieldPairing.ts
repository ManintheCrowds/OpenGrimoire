export type VisualizationFieldOption = {
  value: string;
  label: string;
};

export function getFallbackFieldValue(
  selectedValue: string,
  fields: readonly VisualizationFieldOption[]
): string | null {
  return fields.find((field) => field.value !== selectedValue)?.value ?? null;
}

export function resolveDistinctFieldPair({
  changedField,
  nextValue,
  currentSource,
  currentTarget,
  fields,
}: {
  changedField: 'source' | 'target';
  nextValue: string;
  currentSource: string;
  currentTarget: string;
  fields: readonly VisualizationFieldOption[];
}): { source: string; target: string } {
  if (changedField === 'source') {
    const target =
      nextValue === currentTarget
        ? getFallbackFieldValue(nextValue, fields) ?? currentTarget
        : currentTarget;
    return { source: nextValue, target };
  }

  const source =
    nextValue === currentSource
      ? getFallbackFieldValue(nextValue, fields) ?? currentSource
      : currentSource;
  return { source, target: nextValue };
}
