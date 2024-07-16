'use client'


import { useState } from 'react';
import styles from './RegisterForm.module.css';



const RegistrationInput: React.FC<RegistrationInputProps> = ({ resetForm, noneVisibilityReg, noneVisibilityLogin }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const [isVisibleForm, setIsVisibleForm] = useState<boolean>(true);
  const blockVisibilityForm = () => setIsVisibleForm(true);
	const noneVisibilityForm = () => setIsVisibleForm(false);

	const userNameRegex = /^([\p{L}\p{N}]{1,10}|[\p{L}\p{N}]{1,10}\s[\p{L}\p{N}]{1,10})$/u;

	const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

		setIsLoading(true);

		if (!userNameRegex.test(userName)) {
			setErrorMessage('Username must be one or two words, each up to 10 letters long, separated by a single space.');
			setIsLoading(false);
			return;
		}


    if (password !== confirmPassword) {
      
			setErrorMessage('Пароли не совпадают!');
			setIsLoading(false);
      return;
    }


    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          email,
          password, 
          profilePictureUrl,
        }),
      });


      if (!response.ok) {
      const errorResponse = await response.json(); // Parse the JSON error response
      throw new Error(errorResponse.message || 'Registration failed');
      }


      // Optionally, clear the form or handle successful registration here
			noneVisibilityForm();
			

      console.log('Registration successful');
    } catch (error) {
			let message = "An unknown error occurred";
			if (error instanceof Error) {
				// This is a network error or an error we threw manually
				message = error.message;
			}
			console.error('Registration error:', message);
			setErrorMessage(message);
    }

		finally {
			setIsLoading(false); // Stop loading regardless of the outcome
	}

  };


  return (
		<div>

			{!isVisibleForm && <div className={styles.successRegistration}><div><p>Регистрация прошла успешно!</p></div>
			<button onClick={() => {
				noneVisibilityReg();
				resetForm();
			}} className={styles.successRegistrationButton}>Войти</button></div>}
			

    <form onSubmit={handleRegistration} className={`${styles.registrationForm} ${isVisibleForm ? '' : styles.registrationFormNone}`}>

			{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      <p className={styles.inputRegistrationTitle}>Имя пользователя:</p>
      <input
        className={styles.inputRegistration}
        type="text"
        value={userName}
				onChange={(e) => {
					const inputValue = e.target.value;
					setUserName(inputValue);
					if (inputValue && !userNameRegex.test(inputValue)) {
						setErrorMessage('Username must be one or two words, each up to 10 letters long, separated by a single space.');
					} else {
						setErrorMessage('');
					}
				}}
        placeholder="User Name"
        required
      />
      <p className={styles.inputRegistrationTitle}>Email:</p>
      <input
        className={styles.inputRegistration}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <p className={styles.inputRegistrationTitle}>Пароль:</p>
      <input
        className={styles.inputRegistration}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <p className={styles.inputRegistrationTitle}>Повторите пароль:</p>
      <input
        className={styles.inputRegistration}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      <p className={styles.inputRegistrationTitle}>Фото профиля (опционально):</p>
      <input
        className={styles.inputRegistration}
        type="url"
        value={profilePictureUrl}
        onChange={(e) => setProfilePictureUrl(e.target.value)}
        placeholder="Profile Picture URL (optional)"
      />

			{isLoading && <div className={styles.loadingSpinnerContainer}>
			<div className={styles.loadingSpinner}></div>
			</div>}

      {!isLoading && <button type="submit" className={styles.registrationFormCreateButton}>СОЗДАТЬ</button>}
			
    </form>
		</div>
  );
};

type RegistrationInputProps = {
  resetForm: () => void;
	noneVisibilityReg: () => void;
  noneVisibilityLogin: () => void;
}

type RegistrationFormProps = {
  isVisibleReg: boolean;
  noneVisibilityReg: () => void;
  noneVisibilityLogin: () => void;

};


const RegistrationForm: React.FC<RegistrationFormProps> = ({ noneVisibilityReg, isVisibleReg, noneVisibilityLogin }) => {

	const [key, setKey] = useState(0);

  const resetForm = () => {
    setKey(1);
    setTimeout(() => setKey(0), 0); // Ensure a render cycle in between
  };
	
  return (
   
    <div className={`${styles.registrationFormContainer} ${isVisibleReg ? styles.registrationFormContainerVisible : ''}`}>
    <div className={styles.registrationFormHeader}>
      <p>Регистрация</p>
      <button onClick={() => {
      noneVisibilityReg();
      noneVisibilityLogin();
			resetForm();
    }} className={styles.registrationFormCloseButton}>X</button>
    </div>
    <RegistrationInput key={key} resetForm={resetForm} noneVisibilityReg={noneVisibilityReg} noneVisibilityLogin={noneVisibilityLogin} />


    </div>
   
   
  );
};
export default RegistrationForm;