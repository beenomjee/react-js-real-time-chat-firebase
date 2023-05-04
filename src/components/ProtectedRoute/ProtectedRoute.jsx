import React, { useEffect, useState } from 'react'
import styles from './ProtectedRoute.module.scss';
import { Loader } from '../';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user)
                navigate('/login');
            else {
                setUser(user);
                setIsLoading(false);
            }
        })

        return () => unsubscribe();
    }, []);
    return (
        isLoading ? <Loader /> : <Element user={user} />
    )
}

export default ProtectedRoute;