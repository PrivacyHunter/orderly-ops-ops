# Ambition Sports handover fixes

## Scope
- Replace the blank project with the uploaded Ambition Sports source, excluding uploaded secrets and repository metadata.
- Add the existing **Banners** manager to the control-panel navigation and permissions.
- Rebuild **Products** as a searchable/filterable table with thumbnail, name, category, and edit/duplicate/copy/download/delete actions; use the shared media uploader in add/edit.
- Move Studio Manager video and thumbnail uploads to the stable media-link flow already used by banners/products.
- Connect the homepage hero and Featured Products to published database records, with safe empty/loading behavior.
- Fix production/custom-domain panel authorization by tracing the real authenticated server-function bearer flow and correcting deployment-safe auth behavior without weakening role checks.

## Verification
- Check the generated build diagnostics and route metadata.
- Exercise the public homepage and responsive control-panel UI locally.
- Run an authenticated panel request when a managed test session is available; otherwise report the authenticated production path as unverified rather than overclaiming.
- Verify stored media links use the new `/api/public/media/...` form and role checks still derive identity server-side.

## Technical notes
- Preserve TanStack Start routing and existing database/RLS model.
- Do not import the uploaded `.env` or expose private credentials.
- Use the existing `site-media` storage/media proxy flow rather than legacy direct public bucket URLs.
