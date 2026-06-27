import { User } from "@workspace/api-client-react";

export function getAuthToken(): string | null {
  return localStorage.getItem("docuchat_token");
}

export function setAuthData(token: string, user: User) {
  localStorage.setItem("docuchat_token", token);
  localStorage.setItem("docuchat_user", JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem("docuchat_token");
  localStorage.removeItem("docuchat_user");
}

export function getAuthUser(): User | null {
  const data = localStorage.getItem("docuchat_user");
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch (e) {
    return null;
  }
}
