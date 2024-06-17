# next-rsc-saml-example

Example SAML authentication app using Next.js App Router (RSC) and OneLogin SSO. Uses:

- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) for checking if a user is logged in (see [`middleware.ts`](/middleware.ts))
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) for:
  - generating and redirecting to the OneLogin SAML login URL (see [`app/login/sso/route.ts`](/app/login/sso/route.ts))
  - handling the OneLogin SAML callback POST request and storing the user in a session cookie (see [`app/login/sso/callback/route.ts`](/app/login/sso/callback/route.ts))
- the [`node-saml`](https://github.com/node-saml/node-saml) library (see configuration in [`auth.ts`](/auth.ts))
- a cookie-based session based on [this example](https://github.com/balazsorban44/auth-poc-next) and the [Next.js docs](https://nextjs.org/docs/app/building-your-application/authentication#cookie-based-sessions) (see [`auth.ts`](/auth.ts))
- TypeScript

See the [`passport-saml` source code](https://github.com/node-saml/passport-saml/blob/4d75de41a46abff01429f70be3e40bee3d70fbd4/src/strategy.ts) for more robust auth handling.

## OneLogin configuration

- create OneLogin developer account here: https://developers.onelogin.com/
- for example, use the domain `your-domain`
- at https://your-domain-dev.onelogin.com/admin2/apps select "Add App" > "SAML Custom Connector (Advanced)"
- on "Configuration" tab, set the following 5 fields:
  - "Audience (EntityID)" [1]: `your-example-app`
  - "Recipient": `your-example-app`
  - "ACS (Consumer) URL Validator*": `http://localhost:3000/login/sso/callback`
  - "ACS (Consumer) URL*": `http://localhost:3000/login/sso/callback`
  - "SAML signature event" [1]: "Both"

[1] required as of `node-saml` v4.0.0

## Set environment variables

- copy `.env.example` to `.env` and change the following:
  - `SSO_ENTRYPOINT`: "SSO" tab > "SAML 2.0 Endpoint (HTTP)"
  - `SSO_CERT`: "SSO" tab > "X.509 Certificate" > "View Details" > "X.509 Certificate" with "-----BEGIN CERTIFICATE-----" and "-----END CERTIFICATE-----" and newlines removed
  - `SSO_COOKIE_SESSION_SECRET`: generate or make up a secret string

Note: `SSO_ISSUER` should be "Recipient" on the "Configuration" tab and `SSO_CALLBACK_URL` should be "ACS (Consumer) URL*" on the "Configuration" tab.

**Example `.env`**

``` sh
SSO_ENTRYPOINT='https://your-domain-dev.onelogin.com/trust/saml2/http-post/sso/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

SSO_ISSUER='your-example-app'

SSO_CALLBACK_URL='http://localhost:3000/login/sso/callback'

SSO_CERT='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX='

SSO_COOKIE_SESSION_SECRET='xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

SSO_COOKIE_NAME="cooksess"

SSO_LOGIN_PATH="/login/sso"
```

## Usage

```
$ npm install
$ npm run dev
```

Go to http://localhost:3000 in the browser

## Sequence of requests

1. GET http://localhost:3000/login/sso
2. GET https://your-domain-dev.onelogin.com/trust/saml2/http-post/sso/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
3. POST http://localhost:3000/login/sso/callback
4. GET http://localhost:3000/ (with user session cookie)

## References / See also

- https://github.com/saltycrane/express-node-saml-example
- https://nextjs.org/docs/app/building-your-application/authentication
- https://www.youtube.com/watch?v=DJvM2lSPn6w
- https://github.com/balazsorban44/auth-poc-next
- https://github.com/node-saml/passport-saml/blob/master/src/strategy.ts

## Troubleshooting

### "Access Denied You do not have access to this application. Please contact your administrator."

 - ensure your user is added to the default role for the app in the OneLogin admin UI.
   - go to https://your-domain.onelogin.com/roles
   - select the "Default" role
   - select the "Users" tab
   - ensure your user is added to that role or add it

### Error: Invalid signature

- in the OneLogin admin UI, in the "Configuration" tab, ensure that "SAML signature element" is set to "Both"
- alternatively, as a less secure option, add the following configuration to the `passport-saml` `Strategy`: `wantAssertionsSigned: false`.
- `node-saml` changed in v4.0.0 to require all assertions be signed. See https://github.com/node-saml/node-saml/pull/177

### Error: SAML assertion AudienceRestriction has no Audience value

- in `node-saml`, `audience` defaults to the value of `issuer`
- in the OneLogin admin UI, in the "Configuration" tab, ensure that "Audience (EntityID)" is the same as `issuer`. (In this example it is the value of "Recipient", `your-example-app`)
