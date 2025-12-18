abstract class RestServices {

  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }


  private static getHeaders(additionalHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(additionalHeaders || {})
    };

    const token = this.getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async get<T>(url: string, config?: RequestInit): Promise<T> {
    const headers = this.getHeaders(config?.headers);
    const response = await fetch(url, { ...config, headers });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {

      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async post<T>(url: string, data: unknown, config?: RequestInit): Promise<T> {
    const headers = this.getHeaders(config?.headers);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...config
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        console.error(errorText);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async put<T>(url: string, data: unknown, config?: RequestInit): Promise<T> {
    const headers = this.getHeaders(config?.headers);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...config
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        console.error(errorText);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async patch<T>(url: string, data: unknown, config?: RequestInit): Promise<T> {
    const headers = this.getHeaders(config?.headers);
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      ...config
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        console.error(errorText);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async delete<T>(url: string, config?: RequestInit): Promise<T> {
    const headers = this.getHeaders(config?.headers);
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      ...config
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        console.error(errorText);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }
}

export default RestServices;