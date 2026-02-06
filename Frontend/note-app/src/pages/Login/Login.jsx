import React, { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Password from "../../components/Input/Password";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/login", { email, password });

      if (response.data) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login Error:", err); // Look at your browser console!

      if (err.response) {
        // Server responded with a status code outside 2xx
        setError(err.response.data.message);
      } else if (err.request) {
        // Request was made but no response was received
        setError("Server is not responding. Is it running?");
      } else {
        // Something happened setting up the request
        setError("Request error: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex items-center justify-center px-6 py-12 md:py-20">
        <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-10">
          <form onSubmit={handleLogin} className="flex flex-col">
            <div className="mb-8 text-center">
              <h4 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h4>
              <p className="text-sm text-slate-500 mt-2">
                Please enter your details to log in.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <input
                  type="text"
                  placeholder="Jay@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-blue-200 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Password
                </label>
                <Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-5">
                <p className="text-red-600 text-xs font-medium text-center">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl mt-8 shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Login
            </button>

            <p className="text-sm text-center text-slate-500 mt-8">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
