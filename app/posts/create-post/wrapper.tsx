import styles from './wrapper.module.css';
import { AuthProvider } from '@/app/lib/AuthContext';

export default function Wrapper() {
  return (
		<div className={styles.wrapper}>
		<div className={styles.wrapperContainer}>
			<div className={styles.wrapperContainerHeader}>
				<p>Создай свой пост</p>
				<button>X</button>
				</div>
				

		</div>
		</div>
    
  );
}
