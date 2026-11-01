// One-off Strava OAuth helper: authorizes with activity:read and writes STRAVA_REFRESH_TOKEN into .env.
// Usage (from frontend/): node --env-file=.env scripts/strava-auth.mjs
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';

const PORT = 8721;
const SCOPE = 'read,activity:read';
const { STRAVA_CLIENT_ID: clientId, STRAVA_CLIENT_SECRET: clientSecret } = process.env;

if (!clientId || !clientSecret) {
  console.error('Missing STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET in .env');
  process.exit(1);
}

const authUrl = new URL('https://www.strava.com/oauth/authorize');
authUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: `http://localhost:${PORT}`,
  approval_prompt: 'force',
  scope: SCOPE,
}).toString();

const reply = (res, text) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(text);
};

const server = createServer(async (req, res) => {
  const params = new URL(req.url, `http://localhost:${PORT}`).searchParams;
  const code = params.get('code');
  if (!code) {
    console.error(`No code in callback. Strava error: ${params.get('error') ?? 'none'}`);
    reply(res, 'No code in callback, see the terminal.');
    return;
  }

  const granted = params.get('scope') ?? '';
  if (!granted.includes('activity:read')) {
    reply(res, 'activity:read was not granted. Re-run the script and keep the activities checkbox ticked.');
    console.error(`Granted scope: "${granted}" - missing activity:read`);
    server.close();
    process.exitCode = 1;
    return;
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, grant_type: 'authorization_code' }),
  });
  const data = await tokenRes.json();
  if (!tokenRes.ok || !data.refresh_token) {
    reply(res, 'Token exchange failed, see terminal.');
    console.error(data);
    server.close();
    process.exitCode = 1;
    return;
  }

  const env = readFileSync('.env', 'utf8');
  const line = `STRAVA_REFRESH_TOKEN=${data.refresh_token}`;
  writeFileSync('.env', /^STRAVA_REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^STRAVA_REFRESH_TOKEN=.*$/m, line)
    : `${env.trimEnd()}\n${line}\n`);

  reply(res, 'Done. You can close this tab.');
  console.log(`OK: scope "${granted}", athlete ${data.athlete?.id}. STRAVA_REFRESH_TOKEN updated in .env - restart the dev server.`);
  server.close();
});

server.listen(PORT, () => {
  console.log('Open this URL, keep "View data about your activities" ticked, click Authorize:\n');
  console.log(authUrl.toString());
});
