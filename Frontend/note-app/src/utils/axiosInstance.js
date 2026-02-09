import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://notepadbyunli.onrender.com", // backend URL
  withCredentials: true, // ✅ REQUIRED for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
