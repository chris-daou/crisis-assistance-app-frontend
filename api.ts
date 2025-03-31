import axios from "axios";
import { BACKEND_URL } from "@env"; // Adjust the import based on your environment setup

const API_BASE_URL = `${BACKEND_URL}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include credentials if needed
});

export default api;
