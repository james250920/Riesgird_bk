import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response';
import { Role } from '../models/roles.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly apiUrl = `${environment.backendUrl}/v1/roles`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl);
  }

}
