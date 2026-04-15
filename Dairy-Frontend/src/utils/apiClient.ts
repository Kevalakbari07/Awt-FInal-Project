/**
 * API Client with JWT Authorization
 * Automatically adds Authorization header with Bearer token to all requests
 */

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

interface FetchBaseOptions {
  method?: string
  headers?: Record<string, string>
  body?: string
}

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }

  const token = localStorage.getItem("token")
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

/**
 * Wrapper for fetch that automatically includes JWT token
 */
export async function apiCall(
  endpoint: string,
  options: FetchBaseOptions = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = getAuthHeaders()
  const mergedHeaders = {
    ...defaultHeaders,
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders
  })

  return response
}

/**
 * GET request
 */
export async function apiGet(endpoint: string) {
  const response = await apiCall(endpoint, {
    method: "GET"
  })
  return response.json()
}

/**
 * POST request
 */
export async function apiPost(endpoint: string, data: any) {
  const response = await apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data)
  })
  return response.json()
}

/**
 * PUT request
 */
export async function apiPut(endpoint: string, data: any) {
  const response = await apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data)
  })
  return response.json()
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint: string) {
  const response = await apiCall(endpoint, {
    method: "DELETE"
  })
  return response.json()
}

export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
}
