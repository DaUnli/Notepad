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

  // Basic input sanitization (XSS prevention)
  const sanitizeInput = (value) => {
    const temp = document.createElement("div");
    temp.textContent = value;
    return temp.innerHTML;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedPassword = sanitizeInput(password.trim());

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email");
      return;
    }

    if (!sanitizedPassword) {
      setError("Password cannot be empty");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post(
        "/login",
        {
          email: sanitizedEmail,
          password: sanitizedPassword,
        },
        {
          withCredentials: true, // ✅ allow backend to send cookies
        }
      );

      if (response.data && !response.data.error) {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(sanitizeInput(error.response.data.message));
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex items-center justify-center bg-gray-50 p-4 sm:p-6 min-h-screen -mt-16">
        <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <h4 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Login
            </h4>

            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="email"
            />

            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
            />

            {error && (
              <p className="text-red-500 text-sm" aria-live="assertive">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>

            <p className="text-center text-gray-600">
              Don't have an account?
              <Link to="/signup" className="text-blue-600 font-medium ml-1">
                Create an Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
