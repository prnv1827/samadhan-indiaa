# Samadhan — India-wide Realtime Collaboration Platform

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

Admin login:
- Email: admin@samadhan.local
- Password: admin123

## Workflow

1. Citizen submits a problem -> Pending Admin Approval.
2. Admin approves -> problem becomes Open/Under Review.
3. University applies a team, with an optional solution now or later -> Team Application Pending. If the university chooses “Apply with solution”, the solution is saved immediately as pending and travels with the same Admin approval request.
4. Admin approves the team -> Assigned to University. For “Apply with solution”, that same approval also approves the submitted solution.
5. University can submit a solution later -> Solution Pending Admin Review.
6. Admin approves the solution -> Industry can see the approved solution.
7. Industry sends a collaboration proposal with idea, offer and optional bid -> University receives it live.
8. University accepts/rejects the proposal. Accepting starts the collaboration.
9. University and accepted Industry partner can post realtime progress updates.
10. Industry submits completion summary + proof links -> Pending Final Admin Verification.
11. Admin verifies completion -> Problem becomes RESOLVED.

All request and approval changes are protected by server-side role checks. Realtime updates use Server-Sent Events. Data is stored in `data/*.json` for local/demo deployment; use PostgreSQL/Supabase for durable production persistence on Render.

## New evidence, duplicate and priority features
- Citizens can attach one photo or video as evidence while reporting a challenge.
- Samadhan checks title + description similarity within the same district before creating a new report. If a likely duplicate exists, the user can open it and support the existing problem instead.
- Community support is unique per signed-in account and drives routing priority: the active problem(s) with the highest support count are marked HIGH PRIORITY. Problems are automatically sorted by support count.
- Reports with urgent safety keywords can also be elevated to High Priority.


### Latest features
- Community-support priority: problems are ranked by support count; the current highest-supported active problem is marked HIGH PRIORITY.
- University leaderboard on the home page.
- AI-assisted solution suggestions from the problem detail page.
- Industry completion submissions support before/after photo or video impact evidence.

## Groq AI setup
The solution-suggestion endpoint uses Groq's OpenAI-compatible chat completions API when `GROQ_API_KEY` is configured, with `llama-3.3-70b-versatile` by default. Keep the key server-side as an environment variable; do not commit it to GitHub. On Render, add `GROQ_API_KEY` in the service Environment settings. You can optionally set `GROQ_MODEL` to another supported model. If the key is missing or Groq is temporarily unavailable, Samadhan falls back to its local suggestion engine.
