# next-rsc-auth0-saml-example

Example authentication app using Next.js App Router and React Server Components (RSC) and Auth0 SAML identify provider. Uses:

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) for checking if a user is logged in (see [`middleware.ts`](/middleware.ts))
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) for:
  - generating and redirecting to the Auth0 SAML login URL (see [`app/login/sso/route.ts`](/app/login/sso/route.ts))
  - handling the Auth0 SAML callback POST request and storing the user in a session cookie (see [`app/login/sso/callback/route.ts`](/app/login/sso/callback/route.ts))
- the [`node-saml`](https://github.com/node-saml/node-saml) library (see configuration in [`auth.ts`](/auth.ts))
- a cookie-based session based on [this example](https://github.com/balazsorban44/auth-poc-next) and the [Next.js docs](https://nextjs.org/docs/app/building-your-application/authentication#cookie-based-sessions) (see [`auth.ts`](/auth.ts))
- TypeScript

See the [`passport-saml` source code](https://github.com/node-saml/passport-saml/blob/4d75de41a46abff01429f70be3e40bee3d70fbd4/src/strategy.ts) for more robust auth handling.

## Auth0 configuration

- create Auth0 account at: https://auth0.com
- go to the [Auth0 Dashboard](https://manage.auth0.com/dashboard/)
- go to "Applications" > "Applications" > "Default App"
- go to the "Addons" tab
- click the "SAML2 WEB APP" toggle switch
  - go to the "Settings" tab and set
    - "Application Callback URL": "http://localhost:3000/login/sso/callback"

## Set environment variables

- copy `.env.example` to `.env` and change the following:
  - `SSO_ENTRYPOINT`: "Default App" > "Addons" > "SAML2 WEB APP" > "Usage" > "Identity Provider Login URL"
  - `SSO_CERT`: "Default App" > "Addons" > "SAML2 WEB APP" > "Usage" > "Identity Provider Certificate"
  - `SSO_ISSUER`: "Default App" > "Addons" > "SAML2 WEB APP" > "Usage" > "Issuer"
  - `SSO_COOKIE_SESSION_SECRET`: generate or make up a secret string

Note: `SSO_CALLBACK_PATH` should be the same as the value entered for "Default App" > "Addons" > "SAML2 WEB APP" > "Settings" > "Application Callback URL" (with or without the domain).

**Example `.env`**

``` sh
SSO_ENTRYPOINT="https://dev-xxxxxxxx.us.auth0.com/samlp/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

SSO_ISSUER="urn:dev-xxxxxxxx.us.auth0.com"

SSO_CALLBACK_PATH="/login/sso/callback"

SSO_CERT="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

SSO_COOKIE_SESSION_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Usage

```
$ npm install
$ npm run dev
```

Go to http://localhost:3000 in the browser

## Sequence of requests

1. GET http://localhost:3000 (redirect to #2 if not logged in)
2. GET http://localhost:3000/login/sso
3. GET https://dev-xxxxxxxx.us.auth0.com/samlp/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
4. POST http://localhost:3000/login/sso/callback
5. GET http://localhost:3000 (with user session cookie)

## Signing options

The signing options in `@node-saml/node-saml` need to match the signing options configured in Auth0. See this table below:

    | `node-saml`            | `node-saml`               | Auth0                  |
    | `wantAssertionsSigned` | `wantAuthnResponseSigned` | `signResponse`         |
    |------------------------+---------------------------+------------------------|
    | true                   | false                     | false (default)        |
    | false                  | true                      | true                   |
    | true                   | true                      | (not supported afaict) |
    
The defaults are:
 - `node-saml`: 
   - `wantAssertionsSigned`: true
   - `wantAuthnResponseSigned`: true
 - Auth0
   - `signResponse`: false
   
`node-saml` will give the following errors if not configured properly:
 - when `wantAssertionsSigned` is true, but Auth0 does not sign the assertions, `node-saml` will give a "Invalid signature" error
 - when `wantAuthnResponseSigned` is true, but Auth0 does not sign the response, `node-saml` will give a "Invalid document signature" error

For more information see the documention:

- https://github.com/node-saml/node-saml?tab=readme-ov-file#config-parameter-details
- https://auth0.com/docs/authenticate/protocols/saml/saml-configuration/customize-saml-assertions

## References / See also

- https://github.com/saltycrane/express-node-saml-example
- https://nextjs.org/docs/app/building-your-application/authentication
- https://www.youtube.com/watch?v=DJvM2lSPn6w
- https://github.com/balazsorban44/auth-poc-next
- https://github.com/node-saml/passport-saml/blob/master/src/strategy.ts
- https://auth0.com/docs/authenticate/protocols/saml
