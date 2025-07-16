/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ButtonWithToolTip from './ButtonWithToolTip';

// Mock PatternFly Tooltip to just render its children for simplicity
jest.mock('@patternfly/react-core', () => {
  const original = jest.requireActual('@patternfly/react-core');
  const Tooltip = ({ children, content }) => (
    <div data-testid="tooltip-mock">
      <div data-testid="tooltip-content">{content}</div>
      {children}
    </div>
  );

  // Map isAriaDisabled to aria-disabled for the mock
  const Button = ({ isAriaDisabled, ...props }) => (
    <button aria-disabled={isAriaDisabled ? 'true' : undefined} {...props}>
      {props.children}
    </button>
  );

  return {
    ...original,
    Tooltip,
    Button,
  };
});

describe('ButtonWithToolTip', () => {
  it('renders enabled button and calls onClick', () => {
    const handleClick = jest.fn();
    render(
      <ButtonWithToolTip
        isDisabled={false}
        onClick={handleClick}
        tooltipContent={<span>Tooltip</span>}
      >
        Click me
      </ButtonWithToolTip>,
    );
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).not.toHaveAttribute('aria-disabled');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
    // Tooltip should not be rendered when enabled
    expect(screen.queryByTestId('tooltip-mock')).not.toBeInTheDocument();
  });

  it('renders disabled button with tooltip', () => {
    const tooltipText = 'Disabled reason';
    render(
      <ButtonWithToolTip
        isDisabled={true}
        onClick={jest.fn()}
        tooltipContent={<span>{tooltipText}</span>}
      >
        Disabled
      </ButtonWithToolTip>,
    );
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('tooltip-mock')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      tooltipText,
    );
  });

  it('renders children correctly', () => {
    render(
      <ButtonWithToolTip
        isDisabled={false}
        onClick={() => {}}
        tooltipContent={<span>Tooltip</span>}
      >
        <span>Child Node</span>
      </ButtonWithToolTip>,
    );
    expect(screen.getByText('Child Node')).toBeInTheDocument();
  });

  it('passes extra button props', () => {
    render(
      <ButtonWithToolTip
        isDisabled={false}
        onClick={() => {}}
        tooltipContent={<span>Tooltip</span>}
        data-testid="my-btn"
      >
        Extra Props
      </ButtonWithToolTip>,
    );
    expect(screen.getByTestId('my-btn')).toBeInTheDocument();
  });
});
