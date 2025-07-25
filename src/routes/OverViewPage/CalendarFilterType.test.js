import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CalendarFilterType } from './CalendarFilterType';
import CalendarFilter from '../CalendarFilter';

describe('CalendarFilterType', () => {
  it('Component is CalendarFilter', () => {
    expect(CalendarFilterType.Component).toBe(CalendarFilter);
  });

  describe('chips', () => {
    it('returns formatted chip when value is present', () => {
      expect(CalendarFilterType.chips(['2024-06-01T12:34:56Z'])).toEqual([
        '2024-06-01',
      ]);
    });
    it('returns empty array when value is empty', () => {
      expect(CalendarFilterType.chips([])).toEqual([]);
    });
    it('returns empty array when value is undefined', () => {
      expect(CalendarFilterType.chips(undefined)).toEqual([]);
    });
  });

  describe('selectValue', () => {
    it('returns array with selected value and true', () => {
      expect(CalendarFilterType.selectValue('2024-07-01')).toEqual([
        ['2024-07-01'],
        true,
      ]);
    });
    it('works with empty string', () => {
      expect(CalendarFilterType.selectValue('')).toEqual([[''], true]);
    });
  });

  describe('deselectValue', () => {
    it('returns [undefined, true]', () => {
      expect(CalendarFilterType.deselectValue()).toEqual([undefined, true]);
    });
  });

  it('Component renders without crashing', () => {
    // Just check it renders, not the internals
    const { container } = render(
      <CalendarFilterType.Component value={[]} onChange={() => {}} />,
    );
    expect(container).toBeInTheDocument();
  });
});
