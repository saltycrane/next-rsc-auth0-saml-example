import { SAML } from "@node-saml/node-saml";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { SSO_COOKIE_NAME } from "./constants";
import invariant from "./invariant";

/**
 * saml
 */
invariant(process.env.SSO_CALLBACK_URL, "SSO_CALLBACK_URL must be set");
invariant(process.env.SSO_CERT, "SSO_CERT must be set");
invariant(process.env.SSO_ISSUER, "SSO_ISSUER must be set");

export const saml = new SAML({
  callbackUrl: process.env.SSO_CALLBACK_URL,
  entryPoint: process.env.SSO_ENTRYPOINT,
  idpCert: process.env.SSO_CERT,
  issuer: process.env.SSO_ISSUER,
  // use these 2 signing options when Auth0 is configured with `signResponse: false` (the default)
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: false,
  // audience: process.env.SSO_ISSUER,  // the default for `audience` is the value of `issuer`. Can be set to `false` to disable audience verification.
});

/**
 * Cookie-based session code below was forked from:
 *   https://github.com/balazsorban44/auth-poc-next/blob/9b186df7ea4088d1f48cca371ab94ec7dcb2e25c/lib.ts
 * which was referenced by:
 *   https://www.youtube.com/watch?v=DJvM2lSPn6w
 * which was referenced by:
 *   https://nextjs.org/docs/app/building-your-application/authentication#session-management
 */
const key = new TextEncoder().encode(process.env.SSO_COOKIE_SESSION_SECRET);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 sec from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

type TSession = {
  expires: Date;
  user: TUser;
};

type TUser = Record<string, any>;

export async function login(user: TUser) {
  // Create the session
  const expires = new Date(Date.now() + 10 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set(SSO_COOKIE_NAME, session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  cookies().set(SSO_COOKIE_NAME, "", { expires: new Date(0) });
}

export async function getSession(): Promise<TSession | null> {
  const session = cookies().get(SSO_COOKIE_NAME)?.value;
  if (!session) {
    return null;
  }
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get(SSO_COOKIE_NAME)?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed: TSession = await decrypt(session);
  parsed.expires = new Date(Date.now() + 10 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: SSO_COOKIE_NAME,
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
