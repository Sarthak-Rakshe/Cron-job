Render Cron Job: Backend Pinger (every 13 minutes)

This repo defines a Render Cron Job that pings your backend URL every 13 minutes with a 120s timeout.

What it does

- Calls your backend URL (GET by default; configurable) on a schedule: `*/13 * * * *`.
- Aborts the request if it takes longer than 120 seconds.
- Exits non‑zero on failure so you can inspect logs/alerts in Render.

Files

- `render.yaml` — Render Blueprint defining the Cron Job service.
- `scripts/ping.js` — Minimal Node script that performs the request with timeout.
- `package.json` — Node project manifest for local testing and Render runtime.

Configure
Set the following environment variables for the Cron Job in Render:

- `TARGET_URL` (required): Full URL to your backend endpoint, e.g. `https://your-app.onrender.com/health`.
- `TIMEOUT_MS` (optional): Defaults to `120000` (120 seconds).
- `METHOD` (optional): Defaults to `GET`.

You can set `TARGET_URL` either in the Render Dashboard (recommended) or by editing `render.yaml` and replacing the placeholder.

Deploy to Render

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Render, create a new Blueprint from your repo containing `render.yaml`.
3. Render will provision a Cron Job named `backend-pinger-13m` on Node 18+.
4. In the service settings, add the `TARGET_URL` env var if you didn't commit it.

Local test (optional)
You can test the script locally before deploying.

PowerShell:

```powershell
$env:TARGET_URL = "https://example.com/health"
$env:TIMEOUT_MS = "120000"
$env:METHOD = "GET"
node scripts/ping.js
```

Notes

- Cron expression `*/13 * * * *` runs every 13 minutes.
- Render Cron Jobs run in a short-lived container only for the duration of the job. The script should exit.
- If your endpoint requires authentication, add headers or tokens as needed (extend `ping.js`).

—
If you want me to wire custom headers, a POST body, or retries with backoff, say the word and I’ll add it.
