// Container.tsx
import React from 'react';
import styles from './AlertMessage.module.css';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface ContainerProps {
	message?: string;
  className?: string;
	success?: string;
}

const AlertMessage: React.FC<ContainerProps> = ({  message = '', className = '', success = ''}) => {
  return (
    <div className={`${styles.messageContainer} ${success ? styles.messageContainerSuccess : ''} ${className}`}>
			{!success && <ReportProblemIcon className={styles.iconError}/>}
			{success && <CheckBoxIcon className={styles.iconSuccess}/>}
			<p className={styles.text}>{message}</p>
			{success && <CheckBoxIcon className={styles.iconSuccess}/>}
			{!success && <ReportProblemIcon className={styles.iconError}/>}
    </div>
  );
};

export default AlertMessage;
