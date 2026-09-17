# kevinatruong.com portfolio

This is my portfolio site, designed in Figma and developed with Astro.

<p align="center">
  <img src="webpage_screenshot.png" alt="main page" width="1000"/>
  <br>
  <a href="https://kevinatruong.com/">Portfolio Wepage</a>
  <br>
</p>

## Project Structure

```text
portfolio/
├── frontend/                  # Astro website and static assets
├── backend/                   # Contact, Spotify, and TikTok services
├── deployment/systemd/       # Versioned Linux service definitions
├── docs/                     # Architecture and operating notes
└── .github/workflows/        # Direct-to-main deployments
```

## Installation

1. Clone the repository:
    `git clone https://github.com/truongakevin/portfolio.git`
2. Enter the frontend directory
    `cd portfolio/frontend`
3. Select Node 22.22.1 with `nvm use` from the repository root.
4. Install dependencies in `frontend/` with `npm ci`.
5. Run `npm run check` and `npm run build` to verify the site.
6. Start the local development server with `npm run dev`.

The backend lives in `backend/`. Run `npm ci && npm test` there. Production credentials and TikTok archive data live only on the Linux server. Deployment and route ownership are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Usage

Feel free to use this as a template or reference!
