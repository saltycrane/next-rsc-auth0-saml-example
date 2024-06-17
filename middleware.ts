import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import invariant from "./invariant";

export async function middleware(request: NextRequest) {
  // If not logged in **and not one of the URLs used for logging in**,
  // then redirect to the login URL.
  const session = cookies().get("session")?.value;
  if (!session && !request.nextUrl.pathname.startsWith("/login/sso")) {
    invariant(process.env.SSO_LOGIN_PATH, "SSO_LOGIN_PATH must be set");
    return Response.redirect(new URL(process.env.SSO_LOGIN_PATH, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
