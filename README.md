# next-rsc-saml-example

Example Next.js app with OneLogin SAML SSO authentication.

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

## Todo

- need to somehow determine user authorization/profile info in app. Options:
  - second cookie to store user
  - api call from server component to server api route
  - something better and more RSC/app-router-y?

## See also

- https://github.com/saltycrane/express-passport-saml-example
- https://nextjs.org/docs/app/building-your-application/authentication
- https://www.youtube.com/watch?v=DJvM2lSPn6w
- https://github.com/balazsorban44/auth-poc-next
