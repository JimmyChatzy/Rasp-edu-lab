import { getSession } from "@/lib/auth";

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";

export async function getMe() {
  const session = await getSession();
  
   if (!session?.jwt) {
    throw new Error("Unauthorized");
  }
  
  const response = await fetch(
    `${STRAPI_URL}/api/users/me`,
    {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  console.log("GET ME RESPONSE:", {
    status: response.status,
    ok: response.ok,
    data,
  });


  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch current user"
    );
  }

  return data;
}