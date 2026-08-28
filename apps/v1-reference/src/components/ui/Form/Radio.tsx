import React, { createContext, useContext } from 'react';
import { cn } from '@/utils/cn';

interface RadioGroupContextValue {
  readonly name?: string;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  readonly name?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  children,
  className,
  name,
  value,
  onChange,
  disabled,
  orientation = 'vertical',
  ...props
}) => {
  return (
    <RadioGroupContext.Provider value={{ name, value, onChange, disabled }}>
      <div
        role="radiogroup"
        className={cn('ui-radio-group', `ui-radio-group--${orientation}`, className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  readonly value: string;
  readonly label?: React.ReactNode;
  readonly onChange?: (value: string) => void;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, value, label, disabled, checked, id, onChange, ...props }, ref) => {
    const context = useContext(RadioGroupContext);
    const resolvedName = props.name || context?.name;
    const isChecked = checked !== undefined ? checked : context?.value === value;
    const isDisabled = disabled || context?.disabled;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if (e.target.checked) {
        context?.onChange?.(value);
        onChange?.(value);
      }
    };

    return (
      <label className={cn('ui-radio-container', isDisabled && 'is-disabled', className)}>
        <input
          ref={ref}
          type="radio"
          id={id}
          name={resolvedName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          onChange={handleChange}
          className="ui-radio__input"
          {...props}
        />
        <span className="ui-radio__circle" aria-hidden="true">
          <span className="ui-radio__dot" />
        </span>
        {label && <span className="ui-radio__label">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
