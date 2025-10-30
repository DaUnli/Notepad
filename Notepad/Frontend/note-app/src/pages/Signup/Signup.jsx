import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Password from "../../components/Input/Password";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";

const Signup = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  // 🔒 Sanitize input to prevent XSS attacks
  const sanitizeInput = (value) => {
    const temp = document.createElement("div");
    temp.textContent = value;
    return temp.innerHTML;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Sanitize before validation
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = sanitizeInput(email.trim());
    const sanitizedPassword = sanitizeInput(password.trim());

    if (!sanitizedName) {
      setError("Please enter a valid name");
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      setError("Please enter a valid email");
      return;
    }

    if (sanitizedPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");

    try {
      const response = await axiosInstance.post("/create-account", {
        fullName: sanitizedName,
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      // Handle backend response safely
      if (response.data?.error) {
        setError(sanitizeInput(response.data.message));
        return;
      }

      if (response.data?.accessToken) {
        // Store token safely (consider httpOnly cookie on backend later)
        localStorage.setItem("token", response.data.accessToken);
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
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <h4 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Sign Up
            </h4>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="name"
            />

            <input
              type="email"
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
              autoComplete="new-password"
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
              Create Account
            </button>

            <p className="text-center text-gray-600">
              Already have an account?
              <Link to="/login" className="text-blue-600 font-medium ml-1">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
