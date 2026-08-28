import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Form/Input';
import { FormField } from '../Form/FormField';
import { Checkbox } from '../Form/Checkbox';
import { Switch } from '../Form/Switch';

describe('Form Components', () => {
  it('renders Input and handles text changes', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter username" />);

    const input = screen.getByPlaceholderText(/enter username/i);
    expect(input).toBeInTheDocument();

    await user.type(input, 'sourav');
    expect(input).toHaveValue('sourav');
  });

  it('renders FormField with label, helperText, and linked id', () => {
    render(
      <FormField label="Email Address" helperText="We will never share your email">
        {({ id, 'aria-describedby': describedBy }) => (
          <Input id={id} aria-describedby={describedBy} type="email" />
        )}
      </FormField>
    );

    const label = screen.getByText(/email address/i);
    const input = screen.getByRole('textbox');
    const helper = screen.getByText(/we will never share your email/i);

    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
    expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('-helper'));
    expect(helper).toBeInTheDocument();
  });

  it('renders FormField with error message and sets aria-invalid', () => {
    render(
      <FormField label="Password" errorMessage="Password must be at least 8 characters">
        {({ id, 'aria-describedby': describedBy, isInvalid }) => (
          <Input id={id} aria-describedby={describedBy} isInvalid={isInvalid} type="password" />
        )}
      </FormField>
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent(/password must be at least 8 characters/i);

    const input = document.querySelector('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('toggles Checkbox state and triggers onChange', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms and conditions" />);

    const checkbox = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('toggles Switch state', async () => {
    const user = userEvent.setup();
    render(<Switch label="Enable notifications" />);

    const switchControl = screen.getByRole('switch', { name: /enable notifications/i });
    expect(switchControl).not.toBeChecked();

    await user.click(switchControl);
    expect(switchControl).toBeChecked();
  });
});
