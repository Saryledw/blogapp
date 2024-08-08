import React, { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  label?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
	children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = 'button',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
	children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${styles[size]} ${className}`}
      disabled={disabled || loading}
    >
      {loading ? <span className={styles.spinner}></span> : label || children}
    </button>
  );
};

export default Button;
