'use client';

import { useState, useRef } from 'react';
import FileUploadForm, { FileUploadFormHandle } from './FileUploadForm';
import Button from "./Button";
import AlertMessage from "./AlertMessage";
import Container from "./Container";
import styles from './RegisterForm.module.css';

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
    setUserName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setProfilePictureUrl('');
    setErrorMessage('');
		if (fileUploadRef.current) {
			fileUploadRef.current.resetForm();
		}
  };

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
  const fileUploadRef = useRef<FileUploadFormHandle>(null);

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


				// First, validate the user details
				const validation = await fetch('/api/validate-user-details', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userName,
						email,
					}),
				});
	
				if (!validation.ok) {
					const errorResponse = await validation.json(); // Parse the JSON error response
					throw new Error(errorResponse.message || 'Validation failed');
				}



      let profilePictureUrl = '';

      // Check if files are selected and upload them
      if (fileUploadRef.current) {
				if (fileUploadRef.current.files.length !== 0) 
        {const fileUrls = await fileUploadRef.current.submitFiles();
        if (fileUrls.length > 0) {
          profilePictureUrl = fileUrls[0];
        }}
      }

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

      noneVisibilityForm();
      console.log('Registration successful');
    } catch (error) {
      let message = "An unknown error occurred";
      if (error instanceof Error) {
        message = error.message;
      }
      console.error('Registration error:', message);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.registrationFormContainer} ${isVisibleReg ? styles.registrationFormContainerVisible : ''}`}>
      <Container key={key} header='Регистрация' isButtonVisible={true} onButtonClick={() => {
        noneVisibilityReg();
        noneVisibilityLogin();
        blockVisibilityForm();
        resetForm();
      }} centeredContent={true} noBorder={true} className={styles.registrationFormContent} bigTitle={true}>
        <div className={styles.registrationFormContent2}>
          {!isVisibleForm && <div className={styles.successRegistration}><div><p>Регистрация прошла успешно!</p></div>
            <button onClick={() => {
              noneVisibilityReg();
              blockVisibilityForm();
              resetForm();
            }} className={styles.successRegistrationButton}>Войти</button></div>}

          {isVisibleForm && <form onSubmit={handleRegistration} className={styles.registrationForm}>
            {errorMessage && <AlertMessage message={errorMessage} className={styles.errorMessage}/>}
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
              type="hidden"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              placeholder="Profile Picture URL (optional)"
            />

            <FileUploadForm
							key="upload1"
              ref={fileUploadRef}
              allowedExtensions=".png, .jpeg, .jpg, .webp"
              maxFiles={1}
              filesName="profilePicture"
              uploadButton={false}
              hiddenContent={true}
              className={styles.fileUpload}
            />

            <Button label='СОЗДАТЬ' size='large' type='submit' loading={isLoading} className={styles.createButton} />
          </form>}
        </div>
      </Container>
    </div>
  );
};

export default RegistrationForm;
