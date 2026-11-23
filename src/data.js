// Content taken from Divya Bharat's resume.
export const profile = {
  name: "Divya Bharat",
  handle: "Deviousdivya",
  email: "divyabharat1407@gmail.com",
  location: "Ghaziabad, India",
  title: "Full-Stack Developer · Web Scraping",
  words: ["Full-stack", "AI-powered", "Interactive"],
  intro:
    "Full-stack developer with web scraping and OCR-solving skills, building AI-powered web apps with React, Django and Three.js.",
  bio: [
    "I'm a B.Tech Computer Science student at KIET Group of Institutions (CGPA 8.0 till the 6th semester) who builds full-stack web products — from React and Three.js front-ends to Django back-ends and machine-learning models.",
    "I'm currently a Full Stack Intern at Sarthi EPC, after an SDE internship at StudyDekho. Beyond the core stack I build web scraping and OCR-solving tools, and I'm the developer behind BidVeda's Partial Builder. I've been a national-level hackathon finalist twice and an active member of my college's DevOps tech club for two years.",
  ],
  stats: [
    { value: "10+", label: "Projects shipped" },
    { value: "2", label: "Internships" },
    { value: "2", label: "National hackathon finals" },
  ],
};

export const skills = [
  { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "React", "Three.js", "GSAP", "Tailwind CSS", "Bootstrap"] },
  { group: "Backend", items: ["Django", "Django REST Framework", "Node.js"] },
  { group: "Scraping & OCR", hot: true, items: ["Web Scraping", "OCR Solving", "OCR Solver"] },
  { group: "Programming & databases", items: ["Python", "C", "C++", "MySQL", "PostgreSQL"] },
  { group: "Tools & AI tools", items: ["Git", "GitHub", "VS Code", "Antigravity", "Codex", "Claude", "Prompt Engineering"] },
];

// `image` = desktop screenshot of the live app (project card), `tall` = phone-width full-page screenshot
// (it scrolls on the 3D monitor when the project is clicked). `design` is only a fallback drawing.
export const projects = [
  {
    title: "Partial Builder",
    tag: "BidVeda · government bidding platform",
    featured: true,
    design: "telecom",
    blurb:
      "Built for BidVeda — the ecosystem for government bidders in India, which finds every tender that fits, reads every page and readies the bid.",
    stack: ["BidVeda", "Government tenders", "Full-stack"],
    live: "https://bidveda.in/",
    github: null,
    host: "bidveda.in",
    image: "/projects/bidveda-desk.jpg",
    tall: "/projects/bidveda-tall.jpg",
  },
  {
    title: "Smart Roots",
    tag: "AI-powered learning platform",
    design: "smartroots",
    blurb:
      "An interactive, modern educational platform with personalized learning, performance analytics and AI-driven insights — responsive UI, progress tracking and smart recommendations for students.",
    stack: ["React.js", "JavaScript", "HTML", "CSS", "Vercel", "Django", "API Integration"],
    live: "https://smart-roots.vercel.app/",
    github: "https://github.com/Deviousdivya/Smart-roots",
    host: "smart-roots.vercel.app",
    image: "/projects/smartroots-desk.jpg",
    tall: "/projects/smartroots-tall.jpg",
  },
  {
    title: "Venom Snake Detector",
    tag: "AI-based web application",
    design: "venom",
    blurb:
      "A high-performance web platform that helps reduce snakebite fatalities with real-time AI identification, “Active Perception” photography guidance and an interactive 3D medical emergency suite.",
    stack: ["HTML", "CSS", "JavaScript", "Three.js", "React", "APIs"],
    live: "https://venom-snake-dectector.vercel.app/",
    github: "https://github.com/Deviousdivya/VenomSnake-Dectector",
    host: "venom-snake-dectector.vercel.app",
    image: "/projects/venom-desk.jpg",
    tall: "/projects/venom-tall.jpg",
  },
  {
    title: "NetGuard AI",
    tag: "Telecom network fault prediction",
    design: "telecom",
    blurb:
      "Predicts potential network faults from location, severity and log-volume data (XGBoost) and gives engineers an AI incident copilot, helping them spot fault patterns and resolve issues early.",
    stack: ["Python", "Django", "Scikit-learn", "XGBoost", "React", "GSAP"],
    live: null, // no working live deployment yet - the GitHub link is used
    github: "https://github.com/Deviousdivya/netguard",
    host: "github.com/Deviousdivya/netguard",
    image: "/projects/netguard-desk.jpg",
    tall: "/projects/netguard-tall.jpg",
  },
  {
    title: "Emotional Intelligence System",
    tag: "NLP · emotion prediction",
    design: "emotion",
    blurb:
      "An NLP system that analyzes user reflections to predict emotions and their intensity (TF-IDF + XGBoost) and gives personalized action recommendations through a confidence-aware decision engine.",
    stack: ["Python", "XGBoost", "Scikit-learn"],
    live: "https://emotional-intelligence-system.onrender.com/",
    github: "https://github.com/Deviousdivya/Emotional_Intelligence_System",
    host: "emotional-intelligence-system.onrender.com",
    image: "/projects/emotion-desk.jpg",
    tall: "/projects/emotion-tall.jpg",
  },
];

export const experience = [
  {
    date: "Oct 2026 — Present",
    role: "Full Stack Intern",
    company: "Sarthi EPC Private Limited",
    points: [
      "Full-stack development, along with testing and contributing to deployment.",
      "Handle database tasks.",
      "Developed web scraping solutions and scrapers for data collection and integration.",
    ],
  },
  {
    date: "3 months",
    role: "Software Development Engineer (SDE) Intern",
    company: "StudyDekho",
    points: [
      "Managed both frontend and backend development, maintaining website functionality.",
      "Improved UI components and ensured seamless client-side and server-side integration.",
    ],
  },
];

export const education = [
  { school: "KIET Group of Institutions, Ghaziabad", detail: "B.Tech in Computer Science · CGPA 8.0 (till 6th semester)", years: "2023 – 2027" },
  { school: "KL International School, Meerut", detail: "Class 12th (CBSE) · 93%", years: "2022 – 2023" },
];

export const achievements = [
  { title: "National-level hackathon finalist", detail: "Finalist in 2 out of 3 national-level hackathons — problem-solving, creativity and collaboration under pressure." },
  { title: "College tech club — DevOps", detail: "Active member of the DevOps domain for 2 years: hands-on projects and events." },
];

export const socials = [
  { name: "GitHub", href: "https://github.com/Deviousdivya" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/divya-bharat-348868276" },
  { name: "Email", href: "mailto:divyabharat1407@gmail.com" },
];
