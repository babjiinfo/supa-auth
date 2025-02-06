'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from "framer-motion";

/**
 * Login component for authenticating users with Supabase URL and Service Role Key.
 * @returns {JSX.Element} The login form component.
 */
export default function Home() {
  const [credentials, setCredentials] = useState({ url: '', key: '' });
  const router = useRouter();
  useEffect(() => {
    sessionStorage.removeItem('authData');
  })
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
    }
  };


  return (
    <div className='authPage'>
      <div className="container">
        <div className="authPage_inner">
          <div className="authPage_form">
            <h1 className="authPage_title">Compliance tool</h1>
            <p className="authPage_para">
              Getting started is easy .
            </p>
            <form onSubmit={handleSubmit}>
              <div className='formGroup'>
                <label>Supabase URL</label>
                <input
                  type="text"
                  placeholder="Enter Supabase URL"
                  onChange={(e) => setCredentials({ ...credentials, url: e.target.value })}
                />
              </div>
              <div className='formGroup'>
                <label>Service Role Key</label>
                <input
                  type="text"
                  placeholder="Enter Service Role Key"
                  onChange={(e) => setCredentials({ ...credentials, key: e.target.value })}
                />
              </div>


              <button className='btn authPage_btn' type="submit">Authenticate</button>
            </form>
          </div>
          <div className="authPage_img">
            <motion.img
              src="mainpagelogo.webp"
              alt="logo"
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ ease: "easeInOut", duration: 1.3, delay: 0.1 }}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
