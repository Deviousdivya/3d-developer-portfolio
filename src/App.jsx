import { useEffect } from "react";
import Scene from "./three/Scene";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import { profile, socials } from "./data";
import ScreenForm from "./components/ScreenForm";
import { startSmoothScroll } from "./smooth";

export default function App() {
  useEffect(() => {
    startSmoothScroll();
  }, []);

  return (
    <>
      <Scene />
      <div className="vignette" />
      <ScreenForm />
      <Navbar />
      <main className="content">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <footer className="footer">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <span className="footer-links">
          <a href="/Divya_Bharat_Resume.pdf" download="Divya_Bharat_Resume.pdf">Resume ↓</a>
          {socials.map((s) => (
            <a key={s.name} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {s.name} ↗
            </a>
          ))}
        </span>
      </footer>
    </>
  );
}
