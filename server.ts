// Next.js custom Express.js server example reference:
// https://github.com/vercel/next.js/blob/a9f79980dbbbf7f3d3d40c151c97417232dea760/examples/custom-server-express/server.ts
import "dotenv/config";

import cookieSession from "cookie-session";
import express from "express";
import helmet from "helmet";
import next from "next";
import passport from "passport";
import { Profile, Strategy, VerifiedCallback } from "@node-saml/passport-saml";

const PORT = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

/**
 * Passport.js
 */
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// SAML strategy for passport -- Single IDP
const strategy = new Strategy(
  {
    entryPoint: process.env.SSO_ENTRYPOINT,
    issuer: process.env.SSO_ISSUER,
    callbackUrl: process.env.SSO_CALLBACK_URL,
    idpCert: process.env.SSO_CERT,
    // wantAssertionsSigned: false, // less secure way to avoid "Invalid signature" error
    // audience: process.env.SSO_ISSUER, // the default for `audience` is the value of `issuer`. Can be set to `false` to disable audience verification.
  },
  (profile: Profile, done: VerifiedCallback) => done(null, profile),
  (profile: Profile, done: VerifiedCallback) => done(null, profile),
);

passport.use(strategy);

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
  server.use(passport.initialize());
  server.use(passport.session());

  // This Route Authenticates req with IDP
  // If Session is active it returns saml response
  // If Session is not active it redirects to IDP's login form
  server.get(
    process.env.SSO_LOGIN_PATH,
    passport.authenticate("saml", {
      successRedirect: "/",
      failureRedirect: process.env.SSO_LOGIN_PATH,
    }),
  );

  // This is the callback URL
  // https://www.antoniogioia.com/saml-sso-setup-with-express-and-passport/
  server.post("/login/sso/callback", (req, res) => {
    passport.authenticate(
      "saml",
      (err: any, user?: Express.User | false | null) => {
        if (err) {
          console.error("app.js, /login/sso/callback, err", err);
        }
        console.log("samlAuthRouter.js, /login/sso/callback, user", user);

        // store user in cookie-based session
        req.session.user = user;
        res.redirect("/");
      },
    )(req, res);
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
