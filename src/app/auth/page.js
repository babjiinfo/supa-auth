'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignUp = async () => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, phoneNumber }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success(data.message);
            router.push('/dashboard');
        }
        else {
            toast.error(data?.message);
        }
    };

    const handleSignIn = async () => {
        const res = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (data.success) {
            setIsMfaEnabled(true);
            toast.success(data.message);
        } else {
            toast.error(data.message);
        }
    };

    const handleOtpVerification = async () => {
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success(data.message);
            router.push('/dashboard');
        }
        else {
            toast.error(data?.message);
        }
    };

    return (
        <div className='authPage'>
            <h1 className='authPage_title'>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

            <div className='authPage_tabs'>
                <button
                    className={`btn btn-outlined ${!isSignUp ? 'active' : ''}`}
                    onClick={() => {
                        setIsSignUp(false)
                        setIsMfaEnabled(false)
                    }}
                >
                    {'Switch to Sign In'}
                </button>
                <button
                    className={`btn btn-outlined ${isSignUp ? 'active' : ''}`}
                    onClick={() => {
                        setIsSignUp(true)
                        setIsMfaEnabled(false)
                    }
                    }
                >
                    {'Switch to Sign Up'}
                </button>

            </div>

            <form>
                {isSignUp && (
                    <>
                        <div className='formGroup'>
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className='formGroup'>
                            <label>Phone Number</label>
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>

                        <div className='formGroup'>
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                )}

                {/* Common Fields */}
                <div className='formGroup'>
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* OTP Field - Visible when MFA is enabled */}
                {isMfaEnabled && (
                    <div className='formGroup'>
                        <label>Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                )}

                {/* Submit Button */}
                <div className='authPage_submitBtn'>
                    {isSignUp ? (
                        <button className='btn' type="button" onClick={handleSignUp}>
                            Sign Up
                        </button>
                    ) : isMfaEnabled ? (
                        <button className='btn' type="button" onClick={handleOtpVerification}>
                            Verify OTP
                        </button>
                    ) : (
                        <button className='btn' type="button" onClick={handleSignIn}>
                            Sign In
                        </button>
                    )}
                </div>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
