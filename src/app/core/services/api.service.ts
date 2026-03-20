import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Default request timeout in milliseconds — treat as offline after this */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Centralized HTTP wrapper around Angular HttpClient.
 *
 * - Base URL from environment.apiUrl
 * - 5-second timeout on every request (RxJS timeout operator)
 * - JSON Content-Type by default
 * - Prepared for JWT auth (reads token from localStorage when available)
 */
@Injectable({ providedIn: 'root' })
export class ApiService {

  //#region Properties
  private readonly baseUrl = environment.apiUrl;
  //#endregion

  //#region Constructor
  constructor(private readonly http: HttpClient) {}
  //#endregion

  //#region Public HTTP Methods

  /**
   * Performs a GET request with timeout.
   * @param path Relative path appended to baseUrl (e.g. '/products')
   */
  get<T>(path: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${path}`, { headers: this.buildHeaders() })
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        catchError(error => this.handleError(error)),
      );
  }

  /**
   * Performs a POST request with timeout.
   * @param path Relative path appended to baseUrl
   * @param body Request body
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body, { headers: this.buildHeaders() })
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        catchError(error => this.handleError(error)),
      );
  }

  /**
   * Performs a PUT request with timeout.
   * @param path Relative path appended to baseUrl
   * @param body Request body
   */
  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, body, { headers: this.buildHeaders() })
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        catchError(error => this.handleError(error)),
      );
  }

  /**
   * Performs a DELETE request with timeout.
   * @param path Relative path appended to baseUrl
   */
  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${path}`, { headers: this.buildHeaders() })
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        catchError(error => this.handleError(error)),
      );
  }

  //#endregion

  //#region Private Helpers

  /**
   * Builds default headers for every request.
   * Attaches JWT Bearer token when available in localStorage.
   */
  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Centralizes error logging. Re-throws so callers can handle fallbacks.
   */
  private handleError(error: unknown): Observable<never> {
    console.error('[ApiService] Request failed:', error);
    return throwError(() => error);
  }

  //#endregion

}
