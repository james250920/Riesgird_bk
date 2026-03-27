import { ApiResponse } from './api-response';

export interface LoginRequest {
  email: string;
  password: string;
}

export const LOGIN_FORM_DEFAULTS: LoginRequest = {
  email: '',
  password: ''
};

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  roleId?: string;
  universityId?: string;
  position?: string;
}

export const REGISTER_FORM_DEFAULTS: RegisterRequest = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  roleId: '',
  universityId: '',
  position: ''
};

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  photoUrl?: string;
  phone?: string;
  roleId?: string;
  universityId?: string;
  position?: string;
  isActive: boolean;
}

export interface AuthResponseData {
  user: AuthUserResponse;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export type LoginResponse = ApiResponse<AuthResponseData>;

export type RegisterResponse = ApiResponse<AuthResponseData>;
