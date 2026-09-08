# Reference forest floor v1

AI-generated raster material for the isolated FOREST TEST corridor. Normal PLAY
and NEW remain on their existing renderer. Keep this folder beside KnightRush.html.

Prompt summary: orthographic top-down forest-floor texture, quiet warm brown
earth path through the central 38 percent, fine leaf litter and moss at the
verges, neutral shade, continuous vertical path, no objects or baked perspective,
no pixel-style blocks or broad blotches. Inspired by the user's woodland references.

The image is sampled in world coordinates using a fixed 480-wide floor buffer
and a precomputed anisotropic pyramid. Longitudinal mirroring avoids a hard tile
seam. Outside the authored width only the verge repeats, not another path.
If loading fails, the renderer retains a flat-color fallback.

This is experimental: canopy repetition, full obstacle integration and browser
performance are not approved or complete.
