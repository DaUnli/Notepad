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
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (
      !trimmedName ||
      !validateEmail(trimmedEmail) ||
      password.length < 6
    ) {
      setError("Please fill in all fields correctly");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await axiosInstance.post(
        "/create-account",
        {
          fullName: trimmedName,
          email: trimmedEmail,
          password: password,
        },
        { withCredentials: true }
      );

      if (response.data?.error) {
        setError(sanitize(response.data.message));
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";

      // If the message is an array (from express-validator), take the first error.
      const displayMessage = Array.isArray(errorMessage)
        ? errorMessage[0].msg
        : errorMessage;

      setError(displayMessage);
    } finally {
      setLoading(false);
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
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
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
