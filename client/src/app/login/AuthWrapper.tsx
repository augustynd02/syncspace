'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import styles from './AuthWrapper.module.scss';

export function AuthWrapper() {
  const [isLoginShown, setIsLoginShown] = useState(true);

  const toggleForm = () => {
    setIsLoginShown(!isLoginShown)
  };

  return (
    <div className={`${styles.authWrapper} ${isLoginShown ? null : styles.registerShown}`}>
        <LoginForm handleFormToggle={toggleForm} />
        <RegisterForm handleFormToggle={toggleForm} />
    </div>
  );
}
