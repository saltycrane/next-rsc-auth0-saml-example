// Next.js custom Express.js server example reference:
// https://github.com/vercel/next.js/blob/a9f79980dbbbf7f3d3d40c151c97417232dea760/examples/custom-server-express/server.ts
import "dotenv/config";

import cookieSession from "cookie-session";
import express from "express";
import helmet from "helmet";
import next from "next";
import { SAML } from "@node-saml/node-saml";

const PORT = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * node-saml
 */
const saml = new SAML({
  callbackUrl: process.env.SSO_CALLBACK_URL,
  entryPoint: process.env.SSO_ENTRYPOINT,
  idpCert: process.env.SSO_CERT,
  issuer: process.env.SSO_ISSUER,
  // wantAssertionsSigned: false, // less secure way to avoid "Invalid signature" error
  // audience: process.env.SSO_ISSUER, // the default for `audience` is the value of `issuer`. Can be set to `false` to disable audience verification.
});

/**
 * Next.js app
 */
app.prepare().then(() => {
  const server = express();

  // SAML authentication routes and configuration
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json({ limit: "15mb" }));
  server.use(
    cookieSession({
      name: process.env.SSO_COOKIE_NAME,
      secret: process.env.SSO_COOKIE_SESSION_SECRET,
    }),
  );
  server.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  // This Route Authenticates req with IDP
  // If Session is active it returns saml response
  // If Session is not active it redirects to IDP's login form
  server.get(process.env.SSO_LOGIN_PATH, async (req, res) => {
    try {
      const host = req.headers.host;
      const RelayState = req.query.RelayState || req.body.RelayState;
      const authorizedUrl = await saml.getAuthorizeUrlAsync(
        RelayState,
        host,
        {},
      );
      res.redirect(authorizedUrl);
    } catch (err) {
      res.status(500).send("Error initiating SAML login");
    }
  });

  // This is the callback URL
  server.post("/login/sso/callback", async (req, res) => {
    try {
      const { profile } = await saml.validatePostResponseAsync(req.body);
      console.log("index.ts, /login/sso/callback, profile", profile);
      req.session.user = profile;
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(401).send("Error validating SAML response");
    }
  });

  // All other requests are sent to Next.js handler
  server.get("*", (req, res) => {
    // read user from cookie-based session stored in POST /login/sso/callback
    if (!req.session.user) {
      res.redirect(process.env.SSO_LOGIN_PATH);
    }
    return handle(req, res);
  });

  // Start the HTTP server listening for connections
  server.listen(PORT, () => {
    console.info(`> Ready on http://localhost:${PORT}`);
  });
});
