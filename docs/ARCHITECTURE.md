# Portfolio architecture

## Ownership

- The Mac checkout is the development workspace.
- GitHub is the canonical source and deployment trigger.
- The Linux checkout at `/srv/kevin/projects/portfolio` runs the backends.
- The static frontend is deployed to `/srv/kevin/web/kevinatruong.com`.

## Repository layout

- `frontend/` contains the Astro website.
- `backend/` contains the Contact, Spotify, and TikTok services.
- `deployment/systemd/` contains the versioned service definitions.
- `.github/workflows/` contains direct-to-main production deployments.
- `drafts/` is ignored and contains unpublished local work.

## Runtime configuration and data

- Production Spotify configuration lives in `/srv/kevin/config/env/portfolio.env`.
- `backend/.env` is an ignored symlink to that production file on Linux.
- TikTok archive data lives in `/srv/kevin/data/portfolio/tiktok`.
- `backend/tiktoks` is an ignored symlink to that data on Linux.
- The matching Mac TikTok archive is retained as an off-host backup.

No real environment file or TikTok archive data is committed.

## Public routes

- Frontend: `https://kevinatruong.com/`
- Contact backend: `https://kevinatruong.com/api/contact`
- Spotify backend: `https://kevinatruong.com/api/spotify`
- TikTok backend: `https://kevinatruong.com/api/tiktok`

The internal service ports remain 33322, 59011, and 8855 respectively.
