'use client'

import Link from 'next/link';
import { usePathname} from 'next/navigation'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import styles from './TopNav.module.css';
import Image from "next/image";
import FileUploadForm, { FileUploadFormHandle } from './FileUploadForm';
import Button from "./Button";
import AlertMessage from "./AlertMessage";
import Container from "./Container";
import { useAuth } from '../lib/AuthContext';
import { Label } from '@mui/icons-material';


export function SearchBar ()  {
  const [inputText, setInputText] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  return (
    
      <input className={styles.searchBar}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Найти..."
      />
    
  );
};



type TopNavProps = {
  blockVisibilityLogin: () => void;
	noneVisibilityLogin: () => void;
	isVisibleLogin: boolean;
};

const TopNav: React.FC<TopNavProps> = ({ blockVisibilityLogin, noneVisibilityLogin, isVisibleLogin }) => {


	const [userName, setUserName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const [isVisibleUserMenu, setIsVisibleUserMenu] = useState<boolean>(false);
	const [isVisibleDeleteAccount, setIsVisibleDeleteAccount] = useState<boolean>(false);

	const fileUploadRef = useRef<FileUploadFormHandle>(null);

	const blockVisibilityUserMenu = () => { 
		setIsVisibleUserMenu(true);
		setUserName('');
		setProfilePictureUrl('');
		setErrorMessage('');
		setSuccessMessage('');
		noneVisibilityDeleteAccount();
	}
	const noneVisibilityUserMenu = () => setIsVisibleUserMenu(false);

	const noneVisibilityDeleteAccount = () => setIsVisibleDeleteAccount(false);
	const blockVisibilityDeleteAccount = () => setIsVisibleDeleteAccount(true);

	const userNameRegex = /^([\p{L}\p{N}]{1,10}|[\p{L}\p{N}]{1,10}\s[\p{L}\p{N}]{1,10})$/u;

	const { isAuthenticated, user, isLoading, logout, login, checkAuthAndRefresh } = useAuth();

	useEffect(() => {
    if (errorMessage) {
      setSuccessMessage('');
    } else if (successMessage) {
      setErrorMessage('');
    }
  }, [errorMessage, successMessage]);

	const router = useRouter();

	const handleHomeRedirect = () => {
    router.push('/');
  };

	const handleUpdateProfile = async () => {

		let profilePictureUrl = '';

      // Check if files are selected and upload them
      if (fileUploadRef.current) {
				if (fileUploadRef.current.files.length !== 0) 
        {const fileUrls = await fileUploadRef.current.submitFiles();
        if (fileUrls.length > 0) {
          profilePictureUrl = fileUrls[0];
        }}
      }

		if (!userName && !profilePictureUrl) {
      setErrorMessage('Заполните хотя бы одно поле!');
      return;
    }
    // Validate username
    if (userName && !userNameRegex.test(userName)) {
      setErrorMessage('Username must be one or two words, each up to 10 letters long, separated by a single space.');
      return;
    }

    // Validate profile picture URL (if necessary)
    // For example, you can add URL validation if needed

    // Ensure the user is authenticated before making the update request
    const isAuth = await checkAuthAndRefresh();
    if (!isAuth) {
      setErrorMessage('Please log in again to update your profile.');
			blockVisibilityUserMenu();
      return;
    }

    try {

			

			
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userName: userName || user?.userName,
          profilePictureUrl: profilePictureUrl || user?.profilePictureUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
				setErrorMessage('');
        setSuccessMessage('Profile updated successfully');
				login({
					userName: data.userName,
					profilePictureUrl: data.profilePictureUrl,
					createdAt: data.createdAt // Ensure your API returns this
				});
        checkAuthAndRefresh(); // Refresh the auth state to update the user info
      } else {
        setErrorMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating profile');
    }
  };

	const handleDeleteAccount = async () => {

		const isAuth = await checkAuthAndRefresh();
    if (!isAuth) {
      setErrorMessage('Please log in again to delete your account.');
			noneVisibilityUserMenu();
      return;
    }

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        logout(); // Clear local state and cookies
        setSuccessMessage('Account deleted successfully');
				noneVisibilityUserMenu();

      } else {
        setErrorMessage(data.message || 'Failed to delete account');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting account');
    }
  };


  return (
<div className={styles.topNav}>
	<p onClick={handleHomeRedirect} className={styles.headerLogo}>Blogsite</p>
		<SearchBar/>


		
			
		{!isAuthenticated &&
	<Button label='Log in' size='large' loading={isLoading} className={styles.loginButton} onClick={() => isVisibleLogin ? noneVisibilityLogin() : blockVisibilityLogin()} />
}

{isAuthenticated && user && !isLoading && ( 
	

	<Button onClick={() => isVisibleUserMenu? noneVisibilityUserMenu() : blockVisibilityUserMenu()} className={styles.loggedInUserProfile}>
	<div className={styles.loggedInUserProfilePicture}>
	<Image
    src={user.profilePictureUrl || "/images/profile.png"}
    fill={true} // Makes the image fill the container
    objectFit="cover" // Adjust how the image fits in the container
    alt="User profile image"/>
	</div>
	<p>{user.userName}</p>
	</Button>

	
	
)}

{isAuthenticated && user && ( <div className={` ${styles.loggedInUserProfileMenu} ${isVisibleUserMenu ? styles.loggedInUserProfileMenuVisible : ''} `}>
	<Container className={styles.loggedInUserProfileMenuContainer} centeredContent={false} onButtonClick={noneVisibilityUserMenu} header={`Создан ${new Date(user.createdAt).toLocaleDateString()}`}>
	
	{(errorMessage || successMessage) && <AlertMessage message={errorMessage || successMessage} success={successMessage} />}

	<p className={styles.сhangeInfoTitle}>Сменить информацию пользователя</p>
	<p className={styles.inputChangeInfoTitle}>Имя пользователя:</p>
      <input
        className={styles.inputChangeInfo}
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
      
      <p className={styles.inputChangeInfoTitle}>Фото профиля:</p>
      <input
        className={styles.inputChangeInfo}
        type="hidden"
        value={profilePictureUrl}
        onChange={(e) => setProfilePictureUrl(e.target.value)}
        placeholder="Profile Picture URL"
      />
			<FileUploadForm
							key="upload1"
              ref={fileUploadRef}
              allowedExtensions=".png, .jpeg, .jpg, .webp"
              maxFiles={1}
              filesName="profilePictureChanged"
              uploadButton={false}
              hiddenContent={true}
              className={styles.fileUpload}
							minimize={true}
            />
			<div className={styles.changeInfoButton}>
			<Button label='СМЕНИТЬ' onClick={handleUpdateProfile}/>
			</div>

	<div className={styles.logOutButtonContainer}>
		<Button label='ВЫЙТИ' onClick={() => {noneVisibilityUserMenu(); logout();}}/>
		<div className={styles.deleteAccountTitle} onClick={() => isVisibleDeleteAccount? noneVisibilityDeleteAccount() : blockVisibilityDeleteAccount()}><p>УДАЛИТЬ АККАУНТ</p></div>
		
		{isVisibleDeleteAccount && (<div className={styles.deleteAccountConfirmation}><p>Вы уверены, что хотите удалить аккаунт?</p>
		<div className={styles.deleteAccountConfirmationButtonsContainer}>
			<Button size='small' label='ДА' onClick={handleDeleteAccount}/>
			<Button size='small' label='НЕТ' onClick={noneVisibilityDeleteAccount}/>
		</div>
		</div>)}

	</div>

	</Container>

	</div>
)}

		</div>
	);
	};
	export default TopNav;