import { User } from "../../types/user";
import client from "./client";

interface SignInResponse {
  accessToken: string;
  user: User;
}

export const signIn = async (username: string, password: string) => {
  const response = await client.post<SignInResponse>("/sign-in", {
    username,
    password,
  });

  console.log("response", response);

  return response.data;
};
