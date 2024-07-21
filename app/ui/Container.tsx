// Container.tsx
import React, { ReactNode } from 'react';
import styles from './Container.module.css';
import Button from "./Button";

interface ContainerProps {
  children: React.ReactNode;
	header?: string;
  className?: string;
	buttonClassName?: string;
	centeredContent?: boolean;
	noBorder?: boolean;
	hiddenContent?: boolean;
	bigTitle?: boolean;
	isButtonVisible?: boolean;
	buttonLabel?: ReactNode;
  onButtonClick?: () => void; // Add prop for button onClick handler
	onHeaderClick?: () => void;
}

const Container: React.FC<ContainerProps> = ({ children, header = '', className = '', centeredContent = 'yes', noBorder=false, hiddenContent=false, bigTitle = false, isButtonVisible = true, buttonLabel='X',  buttonClassName, onButtonClick, onHeaderClick }) => {
  return (
    <div className={`${styles.container} ${className}`}>
			<div onClick={onHeaderClick} className={`${styles.header} ${bigTitle ? styles.bigTitle : ''} ${onHeaderClick ? styles.pointerHeader : ''}`}>
			<p className={styles.headerText}>{header}</p>
			{isButtonVisible && <Button label={buttonLabel} onClick={onButtonClick} size='large' className={`${styles.closeButton} ${bigTitle ? styles.bigCloseButton : ''} ${buttonClassName}`} />}
		</div>
		<div  className={`${styles.content} ${centeredContent ? styles.centeredContent : ''} ${noBorder ? styles.noBorder : ''} ${hiddenContent ? styles.hiddenContent : ''}`}>
      {children}
			</div>
    </div>
  );
};

export default Container;
