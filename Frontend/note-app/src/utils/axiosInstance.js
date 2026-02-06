import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://notepadbyunli.onrender.com",
  timeout: 10000,
  withCredentials: true,
});

export default axiosInstance;
