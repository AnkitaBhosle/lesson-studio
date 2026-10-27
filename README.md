# Lesson Studio

A studio that turns what a teacher knows and already has (notes, readings, voice memos, slides) into finished teaching material: narrated explainer videos and lecture decks. It plans the lesson with the teacher, grounds every claim in their sources, and brings professional teaching and production craft without asking them to make production choices.

A concept product, not affiliated with any company.

- Product brief: [`specs/01-product-brief.md`](specs/01-product-brief.md)
- Architecture and agents: [`specs/03-agent-contracts.md`](specs/03-agent-contracts.md)
- Build plan and progress: [`specs/05-build-plan.md`](specs/05-build-plan.md), [`docs/PROGRESS.md`](docs/PROGRESS.md)

## Run locally
```
npm install
npm run dev        # studio on http://localhost:3000, demo mode
npm run dev:lab    # internal lab on http://localhost:3100
```

Checks: `npm run typecheck`, `npm test`, `npm run build`.
