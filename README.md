<div align="center">

# 🖥️ Divya Bharat — 3D Developer Portfolio
### An Interactive, Scroll-Driven Virtual Desk with Live Project Previews and a Working Contact Form

[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Motion](https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)
[![Resend](https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<p align="center">
  <b>As you scroll, the camera glides around a real-time 3D workspace, and every stop tells a part of the story: about, toolkit, projects, experience and contact.</b>
</p>

<p align="center">
  🌐 <b>Live site:</b> <a href="https://3d-developer-portfolio-delta.vercel.app">3d-developer-portfolio-delta.vercel.app</a>
</p>

[Key Features](#-key-features) • [How It Works](#-how-it-works) • [Quick Start](#-quick-start-guide) • [API Reference](#-api-reference) • [Customising](#-customising) • [Technology Stack](#-technology-stack)

---

</div>

## 📌 Overview

A portfolio is usually a list of links. This one is a place. The page is a **virtual developer desk** rendered in WebGL: monitors, headphones, framed photos, a desk lamp and soft-drink cans. Scrolling moves a cinematic camera between **sections** of the story, and each stop pairs the 3D scene with real content.

The monitors do real work. Clicking a project shows a screenshot of that project's live UI on the 3D screen, scrolling through the real page. The final stop flies the camera up to a screen where the **contact form lives**, and messages are delivered straight to the inbox through the [Resend](https://resend.com) API.

```
                ┌───────────────────────────────────────────────┐
                │              Scroll position (Lenis)          │
                └───────────────────────┬───────────────────────┘
                                        │
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
     ┌──────────────────────────┐              ┌──────────────────────────────┐
     │  Camera keyframes         │              │  HTML sections (Motion)       │
     │  desktop & phone framing  │              │  Hero · About · Skills ·      │
     │  src/three/keyframes.js   │              │  Projects · Experience · Contact │
     └────────────┬─────────────┘              └──────────────┬───────────────┘
                  ▼                                           │
     ┌──────────────────────────┐                             │
     │  React Three Fiber scene  │◄────────── project / form ─┘
     │  Desk · screens · mouse   │            selection
     │  bloom · vignette · tone  │
     └────────────┬─────────────┘
                  ▼ (Send)
     ┌──────────────────────────┐        ┌──────────────────────────┐
     │  POST /api/contact        │ ─────► │  Resend API → your inbox  │
     │  Vercel serverless fn     │        │  reply-to = the visitor   │
     └──────────────────────────┘        └──────────────────────────┘
```

---

## ✨ Key Features

- **🎬 Scroll-driven 3D scene**: a real-time WebGL desk built with React Three Fiber and drei, with a camera that glides between sections and reacts to the cursor, plus bloom, vignette and tone mapping for a cinematic finish.
- **🖼️ Real project previews**: click a project card and its live UI opens on the 3D monitor. Desktop screenshots fill the monitor and phone-width full-page captures scroll on the portrait screen.
- **✉️ Contact form on the monitor**: the last page flies the camera to a screen where the form lives. A looping 3D mouse clicks the Send button, and messages arrive in the inbox through Resend with *reply-to* set to the visitor.
- **📱 Responsive by design**: separate camera framing for phones and laptops, and the form moves to the portrait monitor on small screens.
- **📄 Download resume**: one click from the navigation bar, hero, contact bar and footer.
- **🧠 Skills with intent**: a dedicated *Scraping & OCR* group, a *Tools & AI tools* group and featured work such as BidVeda's Partial Builder.
- **✨ Polished motion**: smooth scrolling (Lenis), animated text reveals, a rotating headline, tilt cards and interactive hover states.
- **🛡️ Safe contact endpoint**: input validation and length limits, HTML-escaped email body and a hidden honeypot field that silently drops bots. The API key never reaches the browser.

---

## 🧩 How It Works

| Layer | What it does |
| :--- | :--- |
| **Content** | Everything shown on the page (profile, skills, projects, experience, links) lives in one file, [`src/data.js`](src/data.js). |
| **3D scene** | `src/three/Scene.jsx` and `Desk.jsx` build the desk from code (no external model files). `screens.js` maps each project to its monitor texture. |
| **Camera path** | `src/three/keyframes.js` defines one camera stop per section, with separate desktop and phone values. |
| **Sections** | `src/sections/*` render the readable content layer over the scene using Motion and Lenis. |
| **Contact** | `src/components/ScreenForm.jsx` posts to `/api/contact`; `SendMouse.jsx` animates the 3D mouse. |

---

## 🏗️ Project Structure

```
3d-developer-portfolio/
├── api/
│   └── contact.js             # Serverless endpoint: validates the form, sends via Resend
├── public/
│   ├── projects/              # Desktop (*-desk.jpg) and phone (*-tall.jpg) screenshots per project
│   ├── Divya_Bharat_Resume.pdf
│   └── photo-*.jpg            # Framed photos shown on the desk
├── src/
│   ├── data.js                # All portfolio content
│   ├── three/                 # Scene, Desk, camera keyframes, live screens
│   ├── sections/              # Hero, About, Skills, Projects, Experience, Contact, Navbar
│   ├── components/            # ScreenForm, SendMouse, FlipWords, Reveal, Interact
│   └── *.css                  # Hand-written styles
├── vite.config.js             # Vite + dev-time /api/contact middleware
└── vercel.json                # Vite framework preset
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** and **npm**
- A free **[Resend](https://resend.com/api-keys) API key** for the contact form

### Step 1: Clone the repository

```bash
git clone https://github.com/Deviousdivya/3d-developer-portfolio.git
cd 3d-developer-portfolio
```

### Step 2: Install and configure

```bash
npm install
cp .env.example .env.local     # then add your Resend API key
```

### Step 3: Run

```bash
npm run dev                    # http://localhost:5173
```

The dev server also serves `/api/contact`, so the contact form works locally.

| Script | Purpose |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server (with the contact API). |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |

### Environment variables

| Name | Required | Description |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Yes | API key from [resend.com/api-keys](https://resend.com/api-keys). |
| `CONTACT_TO_EMAIL` | No | Where messages are delivered (defaults to the address in `api/contact.js`). |
| `CONTACT_FROM_EMAIL` | No | Sender on a domain verified in Resend (defaults to Resend's test sender). |

> With Resend's free test sender (`onboarding@resend.dev`), mail can only be delivered to the email address of your own Resend account. Verify a domain to send anywhere.

### ☁️ Deploy on Vercel

1. Import this repository in Vercel (the **Vite** preset is detected automatically).
2. Add the environment variables above under **Settings → Environment Variables**.
3. Deploy. The `api/` folder becomes a serverless function automatically.

---

## 🔌 API Reference

### `POST /api/contact`
Sends a contact-form message to the configured inbox.

**Request**

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "Hi Divya, I'd love to talk about a project."
}
```

| Field | Rules |
| :--- | :--- |
| `name` | Required, trimmed, up to 120 characters |
| `email` | Required, must be a valid address, up to 200 characters |
| `message` | Required, trimmed, up to 5,000 characters |
| `company` | Hidden honeypot. If it is filled the request is accepted but silently dropped. |

**Responses**

| Status | Body | Meaning |
| :--- | :--- | :--- |
| `200` | `{ "ok": true, "id": "..." }` | Message sent. |
| `400` | `{ "error": "Please enter your name, a valid email and a message." }` | Validation failed. |
| `405` | `{ "error": "Method not allowed." }` | Only `POST` is supported. |
| `500` | `{ "error": "The email service isn't configured yet ..." }` | `RESEND_API_KEY` is missing. |
| `502` | `{ "error": "..." }` | Resend rejected the message or could not be reached. |

---

## 🎨 Customising

- Edit **`src/data.js`** for text, skills, projects, experience and links.
- To change a project's preview, replace its screenshots in **`public/projects/`** (desktop `*-desk.jpg`, phone-width full page `*-tall.jpg`).
- Camera stops for each section live in **`src/three/keyframes.js`**.
- To update the downloadable resume, replace **`public/Divya_Bharat_Resume.pdf`** (keep the same file name).

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Framework** | React 19, Vite 6 |
| **3D** | Three.js, React Three Fiber, drei, postprocessing (bloom, vignette, tone mapping) |
| **Motion** | Motion (Framer Motion), Lenis smooth scroll |
| **Backend** | Vercel serverless function (`api/contact.js`) |
| **Email** | Resend REST API |
| **Styling** | Hand-written CSS with Syne (headings), IBM Plex Sans (body), JetBrains Mono (code accents) and Caveat (handwriting) |
| **Deployment** | Vercel |

---

## 🙏 Credits

Fonts: Syne, IBM Plex Sans, JetBrains Mono and Caveat (Google Fonts). All 3D objects are built in code with Three.js, with no external model files.

---

## 🤝 Contributing

This is a personal portfolio, but suggestions and bug reports are welcome. To contribute:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

<div align="center">

© Divya Bharat · [GitHub](https://github.com/Deviousdivya) · [LinkedIn](https://www.linkedin.com/in/divya-bharat-348868276)

</div>
