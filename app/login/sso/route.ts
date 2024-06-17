import { headers } from "next/headers";
import { NextRequest } from "next/server";

import { saml } from "../../../auth";

export async function GET(request: NextRequest) {
  try {
    const host = headers().get("host") ?? undefined;
    const RelayState = request.nextUrl.searchParams.get("RelayState") ?? "/";
    const authorizedUrl = await saml.getAuthorizeUrlAsync(RelayState, host, {});
    return Response.redirect(authorizedUrl);
  } catch (err) {
    console.error(err);
    return new Response("Error initiating SAML login", { status: 500 });
  }
}
