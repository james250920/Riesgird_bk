import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models';
import { environment } from '../../environments/environment';

export interface CreateUserRequest {
  email: string;
  passwordHash: string;
  fullName: string;
  photoUrl?: string;
  phone?: string;
  roleId: string;
  universityId?: string | null;
  position?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserResponseData {
  id?: string;
  email?: string;
  fullName?: string;
  roleId?: string;
  universityId?: string | null;
  position?: string;
  isActive?: boolean;
}

export interface UserApiItem {
  id: string;
  email: string;
  fullName: string;
  photoUrl?: string | null;
  phone?: string | null;
  roleId: string;
  universityId?: string | null;
  position?: string | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersApiUrl = `${environment.backendUrl}/v1/users`;
  private readonly usersRegisterApiUrl = `${this.usersApiUrl}/register`;

  getUsers(): Observable<ApiResponse<UserApiItem[]>> {
    return this.http.get<ApiResponse<UserApiItem[]>>(this.usersApiUrl);
  }

  createUser(payload: CreateUserRequest): Observable<ApiResponse<CreateUserResponseData>> {
    return this.http.post<ApiResponse<CreateUserResponseData>>(this.usersRegisterApiUrl, payload);
  }
}
