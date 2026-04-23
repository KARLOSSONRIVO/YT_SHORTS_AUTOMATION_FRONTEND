export const AUTH_STORAGE_KEY = "shorts-studio-user";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: "active" | "disabled";
  accessToken: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
}
