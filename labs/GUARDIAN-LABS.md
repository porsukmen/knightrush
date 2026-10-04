# Guardian labs

- [Guardian Attack Studio](GuardianAttackLab.html): native game camera, three lanes,
  knight duck/jump references, contact diagnostics and keyframe authoring.
- [Ancient Guardian Model Lab](AncientGuardianModelLab.html): model, original combo
  and version-compatible pose editor.

Both labs open directly with `file://` (double-click the HTML); no local server
is needed. Keep the repository's folders together: they share the native game
scripts and assets. Attack Studio uses a dedicated message channel for the
local-file iframe, preserving the browser's origin protections. HTTP still works.
Local-file and HTTP browser storage are separate: export/import JSON to transfer
your saved poses before switching between them.

Attack Studio controls:

- Left drag on a joint moves it; middle drag rotates it.
- On hand/sword, horizontal middle drag tilts sideways and vertical drag tilts
  into/out of the screen. Sword-axis roll is separate.
- Middle drag on empty space orbits horizontally and vertically; right drag pans.
- Wheel zooms. **Ortala** resets pan, zoom and elevation.
- **Tam ekran** / F expands the scene with its joint panel and foot-ground lock.
- **Oyun kamerası** restores gameplay perspective. Camera movement never edits a pose.

The inspection camera pitches guardian geometry, ground and joint handles. The
native 2.5D knight retains its approved profile with vertical foreshortening; it
is not a new fully pitched mesh. Contact diagnostics use gameplay projection.

Up to 200 keys and 30 seconds per project; explicit new/update, delete/restore,
timeline retiming, interpolation and JSON export/import. Attack Studio uses
`kr-guardian-attack-studio-v1`, separate from the old Model Lab store. Cross-tab
conflicts block writes. Saved browser poses and reference videos remain local;
export JSON to share poses. No automatic gameplay installation.

Tests: `guardian-attack-studio-audit.cjs`, `guardian-attack-camera-audit.cjs`,
`guardian-attack-wrist-audit.cjs`, `ancient-guardian-native-audit.cjs`.
`node labs/guardian-attack-file-audit.cjs [repository-or-build-directory]` checks
both labs with network disabled. Set `GUARDIAN_LAB_URL` to a `file://` URL to run
the studio, camera and wrist audits against a local-file copy.
