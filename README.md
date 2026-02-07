# Adaptive City - Action Intelligence

Hackathon-grade, demo-first Next.js app that turns simulated public feedback into coordinated government action using the OpenAI Responses API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

3. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## What's Simulated vs Real

- Simulated: public feedback ingestion stream, clustering inputs, and seed signals.
- Real: OpenAI Responses API calls for clustering, solutions, feasibility, and policy memo edits.
- Storage: local-only via `localStorage` (no database).

## Demo Script

1. `Collect` -> Start Collection -> Stop -> select a cluster.
2. `Solutions` -> Review brief -> Approve or Reject + revise.
3. `Feasibility` -> Finance/Reg/Ops run in parallel -> Approve pack.
4. `Studio` -> Chat-edit memo with @commands -> Download -> Back to Start.

## Notes

- All OpenAI calls run server-side via `/app/api/*` route handlers.
- The UI is optimized for a clean, judge-friendly demo flow.
