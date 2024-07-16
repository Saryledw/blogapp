// Container.tsx
import React from 'react';
import styles from './Container.module.css';
import Button from "./Button";

interface ContainerProps {
  children: React.ReactNode;
	header?: string;
  className?: string;
	centeredContent?: 'yes' | 'no' ;
	isButtonVisible?: boolean;
  onButtonClick?: () => void; // Add prop for button onClick handler
}

const Container: React.FC<ContainerProps> = ({ children, header = '', className = '', centeredContent = 'yes', isButtonVisible = true, onButtonClick }) => {
  return (
    <div className={`${styles.container} ${className}`}>
			<div className={styles.header}>
			<p className={styles.headerText}>{header}</p>
			{isButtonVisible && <Button label="X" onClick={onButtonClick} size='large' className={styles.closeButton} />}
		</div>
		<div className={styles[centeredContent]}>
      {children}
			</div>
    </div>
  );
};

export default Container;
