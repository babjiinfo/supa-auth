'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard component that displays the user's information after authentication.
 * Redirects to the authentication page if the user is not authenticated.
 *
 * @returns {JSX.Element} The rendered Dashboard component.
 */
export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    /**
     * Fetches the authenticated user data from the API.
     * Redirects to the authentication page if no user is found.
     */
    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            if (!data.user) router.push('/auth');
            else setUser(data.user);
        };

        fetchUser();
    }, []);

    /**
     * Logs out the user by calling the logout API endpoint and redirects to the authentication page.
     */
    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth');
    };

    return (
        <div className='mainPage'>
            <h1 className="mainPage_title">Welcome to the Dashboard</h1>
            {user && <p className="mainPage_para"> {user.email}</p>}
            <button className='btn' onClick={handleLogout}>Logout</button>
        </div>
    );
}
