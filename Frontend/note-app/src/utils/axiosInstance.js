import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // your backend URL
  withCredentials: true,            // 👈 crucial for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
