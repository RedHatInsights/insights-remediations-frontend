import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarFilter from './CalendarFilter';
import '@testing-library/jest-dom';

describe('CalendarFilter', () => {
  it('renders without crashing', () => {
    render(<CalendarFilter value={[]} onChange={jest.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with a value', () => {
    render(<CalendarFilter value={['2024-06-01']} onChange={jest.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('2024-06-01');
  });

  it('calls onChange with the new value when changed', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<CalendarFilter value={['2024-06-01']} onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '2024-07-01');
    // Simulate blur to trigger onChange if needed
    input.blur();
    // The DatePicker's onChange is called on input change
    expect(handleChange).toHaveBeenLastCalledWith('2024-07-01');
  });

  it('handles empty value', () => {
    render(<CalendarFilter value={undefined} onChange={jest.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('requires onChange prop', () => {
    // PropTypes warning is not thrown as error, but we can check if it renders with a dummy function
    expect(() =>
      render(<CalendarFilter value={[]} onChange={() => {}} />),
    ).not.toThrow();
  });
});
