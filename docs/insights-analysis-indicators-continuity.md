# Main Goal
Show sync-only insights data immediately and add analysis-required indicators for Stockfish-dependent sections.

## Important Context
- Two files modified: `+page.svelte` (frontend gating) and `metrics/service.ts` (backend trends)
- `getTrends()` now returns all games with nullable analysis fields instead of filtering to analyzed-only
- Page uses two-level gating: `hasGames` (totalGames > 0) and `hasAnalysis` (analyzedGames > 0)
- Sync-only sections (Results, Top Openings, Rating Over Time, Win Rate, Total Games) always show when games exist
- Analysis-dependent sections show lock icon + "Analyze games" placeholder when no analysis
- `analyzedTrends` derived filters trends for AccuracyTrend/ErrorBreakdown components that expect non-null accuracy
- Pre-existing type errors in RatingTrend.svelte (chart.js type mismatches) are unrelated
