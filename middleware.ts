import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { SSO_COOKIE_NAME } from "./constants";

export async function middleware(request: NextRequest) {
  // If not logged in **and not one of the URLs used for logging in**,
  // then redirect to the login URL.
  const session = cookies().get(SSO_COOKIE_NAME)?.value;
  if (!session && !request.nextUrl.pathname.startsWith("/login/sso")) {
    return Response.redirect(new URL("/login/sso", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
