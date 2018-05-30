# Apps Demo

## With Userinfo Endpoint

create ``.env`` file in app folder with the following properties:

```env
OAUTH2_BASE_URL='https://lp-sentinel-web-qa.dev.lprnd.net/sentinel/api/account'
```

create ``config.json`` file in app/config folder with the following properties

```json
{
  "auth": [
    {
      "clientId": "YOUR_CLIENT_ID",
      "clientSecret": "YOUR_CLIENT_SECRET",
      "accountId": "YOUR_SITE_ID"
    },
    {
      "clientId": "YOUR_OTHER_CLIENT_ID",
      "clientSecret": "YOUR_OTHER_CLIENT_SECRET",
      "accountId": "YOUR_OTHER_SITE_ID"
    }    
  ]
}
```

run:

```sh
docker run --rm -it --env-file .env -p 3000:3000 eitanya/auth-app-mock
```

on login page:
enter Account ID (account must be specified in config.json and in Houston), then click to login with SSO

## Without Userinfo Endpoint

Same as above, just omit the ``OIDC_USERINFO_URL``.