import { ApiResponse, ApiFetchOptions } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ENDPOINTS = {
  profile: "/api/user/profile",
  updateProfile: "/api/user/profile",
  updateLinks: "/api/user/links",
  addWork: "/api/user/work",
  addProject: "/api/user/project/add",
  updateProject: "/api/user/project/update",
  deleteProject: "/api/user/project/delete",
  searchProject: "/api/user/project/search",
};

function getBasicAuthHeader() {
  const user = process.env.NEXT_PUBLIC_BASIC_AUTH_EMAIL!;
  const pass = process.env.NEXT_PUBLIC_BASIC_AUTH_PASS!;
  return `Basic ${btoa(`${user}:${pass}`)}`;
}

async function apiRequest<T = any>(
  path: string,
  { method = "GET", body }: ApiFetchOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  headers.Authorization = getBasicAuthHeader();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log("Full error data:", data);
    const msg = data?.error?.message || data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export { ENDPOINTS, apiRequest };
