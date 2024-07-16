'use client'

import Link from 'next/link';
import { usePathname} from 'next/navigation'
import { useState } from 'react';
import styles from './TopNav.module.css';
import Image from "next/image";
import { useAuth } from '../lib/AuthContext';


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

	const handleUpdateProfile = async () => {
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
	<p className={styles.headerText}>Blogsite</p>
		<SearchBar/>


		{isLoading && <div className={styles.loadingSpinnerContainer}>
			<div className={styles.loadingSpinner}></div>
			</div>}
			
		{!isAuthenticated && !isLoading &&
	<button onClick={() => isVisibleLogin ? noneVisibilityLogin() : blockVisibilityLogin()} className={`${styles.loginButton} `}>Log in</button>
}

{isAuthenticated && user && !isLoading && ( <div className={styles.loggedInUserProfile}>
	<button onClick={() => isVisibleUserMenu? noneVisibilityUserMenu() : blockVisibilityUserMenu()}>
	<div className={styles.loggedInUserProfilePicture}>
	<Image
    src={user.profilePictureUrl || "/images/profile.png"}
    fill={true} // Makes the image fill the container
    objectFit="cover" // Adjust how the image fits in the container
    alt="User profile image"/>
	</div>
	</button>
	<button onClick={() => isVisibleUserMenu? noneVisibilityUserMenu() : blockVisibilityUserMenu()} className={styles.loggedInUserProfileButton}>{user.userName}</button>
	</div>
)}

{isAuthenticated && user && ( <div className={` ${styles.loggedInUserProfileMenu} ${isVisibleUserMenu ? styles.loggedInUserProfileMenuVisible : ''} `}>
	<div className={styles.UserProfileMenuHeader}>
	<p className={styles.userProfileMenuCreationDate}>Создан {new Date(user.createdAt).toLocaleDateString()}</p>
			<button onClick={noneVisibilityUserMenu} className={styles.UserProfileMenuCloseButton}>X</button>
		</div>

	
	
	{errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
	{successMessage && <div className={styles.errorMessage}>{successMessage}</div>}
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
        type="url"
        value={profilePictureUrl}
        onChange={(e) => setProfilePictureUrl(e.target.value)}
        placeholder="Profile Picture URL"
      />
			<button onClick={handleUpdateProfile} className={styles.changeInfoButton}>СМЕНИТЬ</button>
			

	<div className={styles.logOutButtonContainer}>
	<button onClick={() => {
      noneVisibilityUserMenu();
			logout();
    }} className={styles.logOutButton}>ВЫЙТИ</button>
		<div className={styles.deleteAccountTitle} onClick={() => isVisibleDeleteAccount? noneVisibilityDeleteAccount() : blockVisibilityDeleteAccount()}><p>УДАЛИТЬ АККАУНТ</p></div>
		<div className={` ${styles.deleteAccountConfirmation} ${isVisibleDeleteAccount ? styles.deleteAccountConfirmationVisible : ''} `}><p>Вы уверены, что хотите удалить аккаунт?</p>
		<div className={styles.deleteAccountConfirmationButtonsContainer}>
		<button onClick={handleDeleteAccount} className={styles.deleteAccountConfirmationButton}>ДА</button>
		<button onClick={noneVisibilityDeleteAccount} className={styles.deleteAccountConfirmationButton}>НЕТ</button>
		</div>
		</div>
	</div>
	</div>
)}

		</div>
	);
	};
	export default TopNav;