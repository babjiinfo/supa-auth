'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/user');
            const data = await res.json();
            if (!data.user) router.push('/auth');
            else setUser(data.user);
        };

        fetchUser();
    }, []);

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
