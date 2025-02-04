'use client';
import { useEffect, useState } from 'react';

/**
 * Home component that displays user data stored in session storage.
 * Retrieves authentication data and displays a user table if data is available.
 * @returns {JSX.Element} The home page component.
 */
export default function Home() {
    const [userData, setUserData] = useState([]);

    /**
     * Effect hook to retrieve authentication data from session storage.
     * Parses the stored data and updates the state with user details.
     */
    useEffect(() => {
        const storedData = sessionStorage.getItem('authData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData.userData || []);
        }
    }, []);

    return (
        <div className='authPage'>
            <h1>Welcome to Home</h1>
            {userData.length > 0 ? (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Has MFA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userData.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>{user.hasMFA ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
