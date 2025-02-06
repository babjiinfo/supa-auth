'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Login component for authenticating users with Supabase URL and Service Role Key.
 * @returns {JSX.Element} The login form component.
 */
export default function Login() {
    const [credentials, setCredentials] = useState({ url: '', key: '' });
    const router = useRouter();

    /**
     * Handles form submission by sending credentials to the authentication API.
     * If authentication is successful, stores auth data in sessionStorage and navigates to '/home'.
     * @param {React.FormEvent} e - The form submit event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (res.status == 400) {
                const errorData = await res.json();
                toast.error(errorData.message);
                return;
            }

            const data = await res.json();
            sessionStorage.setItem('authData', JSON.stringify(data));
            router.push('/home');
        } catch (error) {
            console.error("Fetch error:", error);
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
