import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://notepadbyunli.onrender.com", // your backend URL
  withCredentials: true,            // 👈 crucial for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
