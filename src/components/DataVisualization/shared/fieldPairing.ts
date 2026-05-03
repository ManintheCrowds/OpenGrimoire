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
