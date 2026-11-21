# Divya Bharat — 3D Developer Portfolio

An interactive, scroll-driven portfolio set on a virtual developer desk. As you scroll, the camera moves around a 3D workspace — monitors, headphones, framed photos — and each stop tells a part of the story: about, toolkit, projects, experience and contact.

> **Live site:** _add your Vercel URL here_

## Highlights

- **Scroll-driven 3D scene** — a real-time WebGL desk (React Three Fiber) with a camera that glides between sections and reacts to the cursor.
- **Real project previews** — click a project card and its live UI opens on the 3D monitor, scrolling through the real page.
- **Contact form on the monitor** — the last page flies the camera up to a screen where the form lives; messages are delivered to my inbox through [Resend](https://resend.com).
- **Responsive by design** — separate camera framing for phones and laptops; the form moves to the portrait monitor on small screens.
- **Polished motion** — smooth scrolling (Lenis), animated text reveals, tilt cards and a looping 3D mouse that clicks the Send button.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 19, Vite 6 |
| 3D | Three.js, React Three Fiber, drei, postprocessing (bloom, vignette, tone mapping) |
| Motion | Motion (Framer Motion), Lenis smooth scroll |
| Backend | Vercel serverless function (`api/contact.js`) |
| Email | Resend REST API |
| Styling | Hand-written CSS |

## Project structure

```
api/contact.js          Serverless endpoint: validates the form and sends the email via Resend
src/data.js             All portfolio content (profile, skills, projects, experience)
src/three/              The 3D desk: scene, camera keyframes, live screens, models
src/sections/           Page sections (Hero, About, Skills, Projects, Experience, Contact)
src/components/         ScreenForm (contact form on the monitor), SendMouse, UI helpers
public/projects/        Screenshots of each project's real UI (shown on the monitor and cards)
```

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Resend API key
npm run dev
```

The dev server also serves `/api/contact`, so the contact form works locally.

### Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | API key from [resend.com/api-keys](https://resend.com/api-keys) |
| `CONTACT_TO_EMAIL` | no | Where messages are delivered (defaults to the email in `api/contact.js`) |
| `CONTACT_FROM_EMAIL` | no | Sender on a domain verified in Resend (defaults to Resend's test sender) |

> With Resend's free test sender (`onboarding@resend.dev`), mail can only be delivered to the email address of your own Resend account. Verify a domain to send anywhere.

## Deploying to Vercel

1. Import this repository in Vercel (framework preset: **Vite** — detected automatically).
2. Add the environment variables above under **Settings → Environment Variables**.
3. Deploy. The `api/` folder becomes a serverless function automatically.

## Customising

- Edit `src/data.js` for text, skills, projects, experience and links.
- To change a project's preview, replace its screenshots in `public/projects/` (desktop `*-desk.jpg`, phone-width full page `*-tall.jpg`).
- Camera stops for each section live in `src/three/keyframes.js`.

## Credits

Fonts: Space Grotesk, JetBrains Mono, Caveat, Pacifico (Google Fonts). All 3D objects are built in code with Three.js.

© Divya Bharat
