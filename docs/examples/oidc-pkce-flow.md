# OIDC PKCE login flow

End-user authentication for fikashop storefronts via `https://oidc.fikachu.com`.

## 1. Discovery

```http
GET https://oidc.fikachu.com/.well-known/openid-configuration
```

## 2. Generate PKCE verifier + challenge

```javascript
function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
const challenge = base64url(
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
);
sessionStorage.setItem("pkce_verifier", verifier);
```

## 3. Authorize redirect

```
GET https://oidc.fikachu.com/authorize/
  ?client_id={OIDC_CLIENT_ID}
  &redirect_uri={encodeURIComponent(OIDC_REDIRECT_URI)}
  &response_type=code
  &scope=openid+profile+email+phone+offline_access
  &state={random_state}
  &code_challenge={challenge}
  &code_challenge_method=S256
```

## 4. Exchange code for tokens

```bash
curl -sS -X POST "https://oidc.fikachu.com/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code={AUTH_CODE}" \
  --data-urlencode "redirect_uri=${OIDC_REDIRECT_URI}" \
  --data-urlencode "client_id=${OIDC_CLIENT_ID}" \
  --data-urlencode "code_verifier=${PKCE_VERIFIER}"
```

## 5. Merge basket

After tokens:

1. Flip `Session-Id` from `SID:ANON:…` to `SID:AUTH:…` (same UUID).
2. `GET /shop/api/start-session/` with `Authorization: Bearer {access_token}`.

See [client-setup.ts](client-setup.ts) and [contracts/INTEGRATION.md](../../contracts/INTEGRATION.md#1-bootstrap).

## 6. Refresh on 401

```bash
curl -sS -X POST "https://oidc.fikachu.com/token/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "refresh_token=${REFRESH_TOKEN}" \
  --data-urlencode "client_id=${OIDC_CLIENT_ID}"
```
