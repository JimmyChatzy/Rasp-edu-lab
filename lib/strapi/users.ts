import { cache } from "react";
import { strapiFetch } from "./client";

export interface StrapiUser {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  role?: { name: string; type: string };
}

// cache(): several components calling getMe() in one render cost a single request
export const getMe = cache(() => strapiFetch<StrapiUser>("/api/users/me?populate=role"));