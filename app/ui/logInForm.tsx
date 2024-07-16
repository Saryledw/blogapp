'use client'

import { useState } from 'react';
import styles from './logInForm.module.css';
import { useAuth } from '../lib/AuthContext';



const LogInInput: React.FC<LogInInputProps> = ({ noneVisibilityLogin, isVisibleLogin }) => {

  const [loginField, setLoginField] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const { login } = useAuth(); 

	const resetForm = () => {
		setLoginField('');
		setPassword('');
		setErrorMessage('');
  };

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
			const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({loginField, password })
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Login failed');
    }

    const data = await response.json();
      console.log('Logged in successfully');
      login({
        userName: data.userName,
        profilePictureUrl: data.profilePictureUrl,
				createdAt: data.createdAt // Ensure your API returns this
      });
			noneVisibilityLogin();
			resetForm();
			
    // Redirect user or save the token in local storage
		
		} catch (error) {
			let message = "An unknown error occurred";
			if (error instanceof Error) {
				// This is a network error or an error we threw manually
				message = error.message;
			}
			console.error('Login error:', message);
			setErrorMessage(message);
    }

  };

  return (
		
		<form onSubmit={handleLogin} className={styles.inputLogInContainer}>
		{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
    <div style={{marginTop: '3%'}}>
      <input className={styles.inputLogIn}
        type="text"
        value={loginField}
        onChange={(e) => setLoginField(e.target.value)}
        placeholder="Email..."
      />
			<input
        className={styles.inputLogIn} 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password..."
      />
			</div>
			<button type="submit" className={styles.logInButton}>ВОЙТИ</button>
			</form>
  );
};

type LogInFormProps = {
  blockVisibilityReg: () => void;
	isVisibleLogin: boolean;
  noneVisibilityLogin: () => void;
};

type LogInInputProps = {
	isVisibleLogin: boolean;
  noneVisibilityLogin: () => void;
};

const LogInForm: React.FC<LogInFormProps> = ({ blockVisibilityReg, noneVisibilityLogin, isVisibleLogin }) => {

	const [key, setKey] = useState(0);

  const resetForm = () => {
    setKey(1);
    setTimeout(() => setKey(0), 0); // Ensure a render cycle in between
  };

  return (
		
		<div className={` ${styles.logInFormContainer} ${isVisibleLogin ? styles.logInFormContainerVisible : ''} `}>
		<div className={styles.logInFormHeader}>
			<p>Вход</p>
			<button onClick={() => {
      noneVisibilityLogin();
			resetForm();
    }} className={styles.logInFormCloseButton}>X</button>
		</div>
		
		<LogInInput key={key} noneVisibilityLogin={noneVisibilityLogin} isVisibleLogin={isVisibleLogin}/>
		<div className={styles.logInFormCreate}>
		<p>Нет аккаунта?</p>
		<button onClick={blockVisibilityReg} className={styles.logInFormCreateButton}>СОЗДАТЬ</button>
		</div>
		</div>
		
    
  );
}; 
export default LogInForm;