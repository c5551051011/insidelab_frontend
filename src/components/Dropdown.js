import React from 'react';
import { colors, spacing } from '../theme';

const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  required = false,
  style = {},
  className = ""
}) => {
  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      <select
        value={value || ''}
        onChange={onChange}
        disabled={disabled || loading}
        style={{
          width: '100%',
          height: '56px',
          padding: `0 ${spacing[4]}`,
          paddingRight: '40px',
          fontSize: '14px',
          border: `2px solid ${colors.border}`,
          borderRadius: '8px',
          outline: 'none',
          backgroundColor: colors.background,
          color: colors.textPrimary,
          fontFamily: 'Inter',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='M0 1.5L2 3.5L4 1.5z'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '12px',
          opacity: disabled || loading ? 0.6 : 1
        }}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={option.style || {}}
          >
            {option.label}
          </option>
        ))}
      </select>

      {loading && (
        <div style={{
          position: 'absolute',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          border: '2px solid transparent',
          borderTop: `2px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
    </div>
  );
};

const DropdownField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  loading = false,
  required = false,
  style = {},
  className = ""
}) => {
  return (
    <div style={{ marginBottom: spacing[5], ...style }} className={className}>
      <label style={{
        display: 'block',
        fontSize: '16px',
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing[2],
        fontFamily: 'Inter'
      }}>
        {label} {required && <span style={{ color: colors.error }}>*</span>}
      </label>
      <Dropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        required={required}
      />
    </div>
  );
};

export { Dropdown, DropdownField };
export default Dropdown;