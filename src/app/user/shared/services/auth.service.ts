import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import {AuthResponse, LoginParams, User, UserResponse} from '../../../shared/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  HOST = 'http://52.57.253.240:3000';
  AUTH_URL = '/api/auth';
  USER_URL = '/api/users';
  LOCAL_STORAGE_TOKEN_KEY = 'token';

  public error$: Subject<string> = new Subject<string>();

  public authToken: string;
  public user: User;

  private response: AuthResponse;

  constructor(private http: HttpClient) { }

  get tokenFromLocalStorage() {
    return localStorage.getItem(this.LOCAL_STORAGE_TOKEN_KEY);
  }

  get authHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.tokenFromLocalStorage}`
      })
    };
  }

  login(params: LoginParams): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.HOST}${this.AUTH_URL}`, params)
      .pipe(
        tap((response) => {
        this.setToken(response);
        },
        catchError(this.handleError.bind(this))
      ));
  }

  logout(): void {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getUserByToken() {
    return this.http.get<UserResponse>(`${this.HOST}${this.USER_URL}`, this.authHttpOptions)
      .pipe(map((response) => {
        this.user = response.user;
      }));
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    const message = error.error.error;
    console.log(message);

    switch (message) {
      case 'Invalid email or password.':
        this.error$.next('Невірна адреса електронної пошти або пароль.');
        break;
    }

    return throwError(error);
  }

  private setToken(response: AuthResponse | null): void {
    console.log(response);
    if (response) {
      localStorage.setItem(this.LOCAL_STORAGE_TOKEN_KEY, response.token);
      localStorage.setItem('firstName', response.user.first_name);
      localStorage.setItem('lastName', response.user.last_name);
      localStorage.setItem('currentUserId', response.user.id.toString());
    } else {
      localStorage.clear();
    }

    this.response = response;
    this.user = response.user;
    this.authToken = response.token;
  }
}