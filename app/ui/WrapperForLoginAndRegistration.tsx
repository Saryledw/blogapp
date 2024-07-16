'use client'

import { useEffect, useState } from 'react';
import styles from './WrapperForLoginAndRegistration.module.css';
import RegistrationForm from "./RegisterForm";
import LogInForm from "./logInForm";
import TopNav from "./TopNav";



export default function WrapperForLoginAndRegistration() {

	const [isVisibleReg, setIsVisibleReg] = useState<boolean>(false);
	const [isVisibleLogin, setIsVisibleLogin] = useState<boolean>(false);

  const blockVisibilityReg = () => setIsVisibleReg(true);
	const noneVisibilityReg = () => setIsVisibleReg(false);

	const blockVisibilityLogin = () => setIsVisibleLogin(true);
	const noneVisibilityLogin = () => setIsVisibleLogin(false);

	useEffect(() => {
    if (isVisibleReg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup function to re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisibleReg]); // Dependency array ensures this effect runs only when isFormVisible changes


  return (
		<div className={styles.wrapperForLoginAndRegistration}>
		<RegistrationForm noneVisibilityReg={noneVisibilityReg} isVisibleReg={isVisibleReg} noneVisibilityLogin={noneVisibilityLogin}/>
		<LogInForm blockVisibilityReg={blockVisibilityReg} noneVisibilityLogin={noneVisibilityLogin} isVisibleLogin={isVisibleLogin} />
		
		<TopNav blockVisibilityLogin={blockVisibilityLogin} noneVisibilityLogin={noneVisibilityLogin} isVisibleLogin={isVisibleLogin} />
		
		</div>
		
  );
}