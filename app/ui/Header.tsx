'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/AuthContext';
import { useState } from 'react';
import styles from './Header.module.css';
import Button from "./Button";

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, checkAuthAndRefresh } = useAuth();
	const [titleText, setTitleText] = useState('Создай пост!');

  const handleCreatePost = async () => {
    const isAuth = await checkAuthAndRefresh();
    if (isAuth) {
      router.push('/posts/create-post'); // Replace with your actual create post page route
    } else {
      // Redirect to login or show an error message
      setTitleText('Пожалуйста, авторизуйтесь, чтобы создать пост!'); // Replace with your actual login page route
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContentContainer}>
        <p className={styles.titleText}>{titleText}</p>
        
				<Button label='СОЗДАТЬ' onClick={handleCreatePost} size='large' className={styles.createPostButton}/> 
      </div>
    </div>
  );
}

