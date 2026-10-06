import type { User } from "./types";

const STRAPI_URL =
    process.env.STRAPI_URL ?? "http://localhost:1337";

export async function loginWithStrapi(
    identifier: string,
    password: string
): Promise<{
    jwt: string;
    user: User;
}> {
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier,
            password,
        }),
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ?? "Invalid email or password"
        );
    }

    return data;
}

export async function registerWithStrapi(
    username: string,
    email: string,
    password: string
): Promise<{
    jwt: string;
    user: User;
}> {
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password,
        }),
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ?? "Unable to create account"
        );
    }

    return data;
}