// src/app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// CHANGED: Imported faPhone instead of faEnvelope
import { faPhone, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
  const router = useRouter();
  // CHANGED: State is now phoneNumber
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_MODERN_TRACKER_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // SimpleJWT looks for your model's USERNAME_FIELD, which you defined as 'phone_number'
          phone_number: phoneNumber, 
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 1. Save tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        
        // 2. Save User Info
        // CHANGED: storing phone instead of email for display
        localStorage.setItem("user_phone", phoneNumber);

        // 3. Redirect to Dashboard
        router.push("/"); 
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0f1535] mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Enter your phone number to access the inventory.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder-gray-400"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f1535] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition-transform active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
               <>
                 <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                 Signing in...
               </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;