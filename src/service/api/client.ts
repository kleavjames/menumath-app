import { useAuthStore } from "@/store/auth";
import { create } from "apisauce";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const client = create({
  baseURL: API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10 * 1000,
});

client.addAsyncRequestTransform((request) => async () => {
  const token = useAuthStore.getState().token;

  if (token) {
    request.headers = request.headers || {};
    request.headers["Authorization"] = `Bearer ${token}`;
  }
});

export default client;
