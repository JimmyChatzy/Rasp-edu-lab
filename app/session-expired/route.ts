import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function GET(request: Request) {
  await clearSession();
  return NextResponse.redirect(new URL("/login?reason=expired", request.url));
}

/*import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  (await cookies()).delete("session"); // use YOUR cookie name from lib/auth
  return NextResponse.redirect(new URL("/login?reason=expired", request.url));
} */