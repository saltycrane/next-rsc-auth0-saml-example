import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import { login, saml } from "../../../../auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const SAMLResponse = formData.get("SAMLResponse") as string;
    const { profile } = await saml.validatePostResponseAsync({ SAMLResponse });
    if (!profile) {
      return new Response("No user profile in SAML response", { status: 401 });
    }
    login(profile);
  } catch (err) {
    return new Response("Error validating SAML response", { status: 401 });
  }
  // `redirect` internally throws an error so it should be called outside
  // of try/catch blocks. See
  // https://nextjs.org/docs/app/building-your-application/routing/redirecting#redirect-function
  redirect("/");
}
