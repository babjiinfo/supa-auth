"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <div className="mainPage">
      <h1 className="mainPage_title">Welcome to Our App</h1>
      <p className="mainPage_para">
        Getting started is easy. Just click below to log in!
      </p>
      <button className="btn" type="button" onClick={handleSignIn}>
        Sign In
      </button>
    </div>
  );
}
