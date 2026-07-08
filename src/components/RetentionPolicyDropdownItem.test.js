/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import RetentionPolicyDropdownItem, {
  ORG_ADMIN_TOOLTIP_TEXT,
} from './RetentionPolicyDropdownItem';

jest.mock('@patternfly/react-core', () => ({
  DropdownItem: ({
    children,
    onClick,
    isDisabled,
    isAriaDisabled,
    tooltipProps,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isAriaDisabled ? 'true' : undefined}
      data-tooltip-content={tooltipProps?.content}
    >
      {children}
    </button>
  ),
}));

describe('RetentionPolicyDropdownItem', () => {
  it('disables the item and exposes the tooltip for non-admin users', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <RetentionPolicyDropdownItem
        canManageRetentionPolicy={false}
        isLoading={false}
        onClick={onClick}
      />,
    );

    const item = screen.getByRole('button', { name: /edit retention policy/i });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute(
      'data-tooltip-content',
      ORG_ADMIN_TOOLTIP_TEXT,
    );

    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('enables the item for organization administrators', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <RetentionPolicyDropdownItem
        canManageRetentionPolicy={true}
        isLoading={false}
        onClick={onClick}
      />,
    );

    const item = screen.getByRole('button', { name: /edit retention policy/i });
    expect(item).not.toHaveAttribute('aria-disabled');
    expect(item).not.toHaveAttribute('data-tooltip-content');

    await user.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the item disabled without a tooltip while org-admin status loads', () => {
    render(
      <RetentionPolicyDropdownItem
        canManageRetentionPolicy={false}
        isLoading={true}
        onClick={jest.fn()}
      />,
    );

    const item = screen.getByRole('button', { name: /edit retention policy/i });
    expect(item).toBeDisabled();
    expect(item).not.toHaveAttribute('aria-disabled');
    expect(item).not.toHaveAttribute('data-tooltip-content');
  });
});
