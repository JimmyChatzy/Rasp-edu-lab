import { getSession } from "@/lib/auth";

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";

export async function getMe() {
  const session = await getSession();
  
   if (!session?.jwt) {
    throw new Error("Unauthorized");
  }
  
  const response = await fetch(
    `${STRAPI_URL}/api/users/me?populate=role`,
    {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch current user"
    );
  }

  return data;
}