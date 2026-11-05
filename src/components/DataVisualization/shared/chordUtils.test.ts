import { describe, expect, it } from 'vitest';
import { processChordData } from './chordUtils';

describe('processChordData', () => {
  it('keeps rendering when autoplay reaches a field Sync Session v2 leaves null', () => {
    const data = [
      {
        tenure_years: null,
        learning_style: 'visual',
        shaped_by: 'mentor',
        peak_performance: null,
        motivation: null,
      },
      {
        tenure_years: null,
        learning_style: 'auditory',
        shaped_by: 'team',
        peak_performance: null,
        motivation: null,
      },
    ];

    const result = processChordData(data, 'tenure_years', 'peak_performance', {});

    expect(result.names).toEqual(['0-5']);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]?.category).toBe('0-5');
    expect(result.names).not.toContain(null);
  });

  it('counts only rows that have both categories populated', () => {
    const data = [
      { learning_style: 'visual', motivation: null },
      { learning_style: 'visual', motivation: 'impact' },
      { learning_style: 'auditory', motivation: 'impact' },
    ];

    const result = processChordData(data, 'learning_style', 'motivation', {});

    expect(result.names).toEqual(['visual', 'auditory', 'impact']);
    const visual = result.names.indexOf('visual');
    const impact = result.names.indexOf('impact');
    expect(result.matrix[visual]?.[impact]).toBe(1);
    expect(result.matrix[result.names.indexOf('auditory')]?.[impact]).toBe(1);
  });

  it('still counts fully populated rows', () => {
    const data = [
      { tenure_years: 2, learning_style: 'visual' },
      { tenure_years: 8, learning_style: 'visual' },
    ];

    const result = processChordData(data, 'tenure_years', 'learning_style', {});

    expect(result.names).toEqual(['0-5', '6-10', 'visual']);
    expect(result.matrix[0]?.[2]).toBe(1);
    expect(result.matrix[1]?.[2]).toBe(1);
  });

  it('returns an empty layout when every selected value is null', () => {
    const data = [
      { peak_performance: null, motivation: null },
      { peak_performance: null, motivation: undefined },
    ];

    expect(processChordData(data, 'motivation', 'peak_performance', {})).toEqual({
      matrix: [],
      names: [],
      groups: [],
      chords: [],
    });
  });
});
