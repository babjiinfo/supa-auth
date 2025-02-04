'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [credentials, setCredentials] = useState({ url: '', key: '' });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('authData', JSON.stringify(data));
            router.push('/home');
        }
    };

    return (
        <div className='authPage'>
            <form onSubmit={handleSubmit}>
                <div className='formGroup'>
                    <label>Supabase URL</label>
                    <input
                        type="text"
                        placeholder="Supabase URL"
                        onChange={(e) => setCredentials({ ...credentials, url: e.target.value })}
                    />
                </div>
                <div className='formGroup'>
                    <label>Service Role Key</label>
                    <input
                        type="text"
                        placeholder="Service Role Key"
                        onChange={(e) => setCredentials({ ...credentials, key: e.target.value })}
                    />
                </div>


                <button className='btn' type="submit">Authenticate</button>
            </form>
        </div >
    );
}
