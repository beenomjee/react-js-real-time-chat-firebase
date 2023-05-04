import React, { useEffect, useState } from 'react'
import styles from './Login.module.scss';
import { FcGoogle } from 'react-icons/fc';
import { Loader } from '../../components';
import { onAuthStateChanged } from 'firebase/auth'
import { auth, googleLogin } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const handleClick = async () => {
        setIsLoading(true);
        try {
            await googleLogin();
            navigate('/')
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error(err);
            alert(err.message);
        }
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user)
                navigate('/')
            else
                setIsLoading(false);
        })

        return () => unsubscribe();
    }, []);
    return (
        isLoading ? <Loader /> :
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <button onClick={handleClick}>
                        <span className={styles.icon}><FcGoogle /></span>
                        <span className={styles.text}>Sign in with Google</span>
                    </button>
                </div>
            </div>
    )
}

export default Login