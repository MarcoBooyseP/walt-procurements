"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/home");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-lg mx-auto bg-white min-h-screen shadow-2xl sm:min-h-0 sm:mt-10 sm:rounded-[32px] sm:overflow-hidden flex flex-col">
        
        {/* Header matching home page */}
        <header className="bg-brand-red text-white px-6 py-8 sm:px-8 text-center rounded-b-3xl sm:rounded-none sm:rounded-t-[32px] shadow-md z-10 relative">
          <img 
            src="/images/walt_logo_white.png" 
            alt="Walt Landgoed Logo" 
            className="h-14 mx-auto object-contain relative z-10 mb-3"
          />
          <p className="text-white/90 font-medium text-[17px] relative z-10">Welcome Back</p>
        </header>

        {/* Form Container matching home page */}
        <div className="flex-1 px-5 py-8 sm:p-8 bg-gray-50/50 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-brand-gray tracking-tight">Admin Login</h1>
              <p className="text-sm text-gray-500 mt-2">Please sign in to your account</p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-brand-gray ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                placeholder="email@waltlandgoed.com"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-brand-gray">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all duration-200 text-gray-900 placeholder:text-gray-400 pr-12"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-brand-gray focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-brand-red hover:bg-[#8c1e24] text-white font-medium rounded-2xl shadow-lg shadow-brand-red/30 hover:shadow-brand-red/40 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2 mt-4"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
