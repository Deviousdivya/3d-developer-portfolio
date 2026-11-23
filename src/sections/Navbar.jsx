import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { profile } from "../data";
import { scrollToId } from "../smooth";

const links = [
  ["home", "Home"],
  ["about", "About"],
  ["skills", "Skills"],
  ["projects", "Work"],
  ["experience", "Journey"],
  ["contact", "Contact"],
];

export default function Navbar() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    links.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <header className="nav">
      <motion.div className="nav-progress" style={{ scaleX: progress }} />
      <div className="nav-inner">
        <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); scrollToId("home"); }}>
          {profile.name.split(" ")[0]}
          <span>.</span>
        </a>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([id, label]) => (
            <a
              key={id}
              href={"#" + id}
              className={active === id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
                scrollToId(id);
              }}
            >
              {label}
            </a>
          ))}
          <a className="nav-resume" href="/Divya_Bharat_Resume.pdf" download="Divya_Bharat_Resume.pdf">
            Resume ↓
          </a>
        </nav>
        <button className="burger" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
