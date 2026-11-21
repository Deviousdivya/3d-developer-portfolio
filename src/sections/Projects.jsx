import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Reveal from "../components/Reveal";
import { SplitText, Tilt } from "../components/Interact";
import { projects } from "../data";
import { landingDataURL } from "../three/screens";
import { world } from "../three/keyframes";

// Each card shows the real UI of the project (screenshot of the live site); if there is none yet, a drawn preview
function Preview({ p }) {
  const [src, setSrc] = useState(() => p.image || landingDataURL(p));
  useEffect(() => {
    if (p.image) return;
    document.fonts?.ready.then(() => setSrc(landingDataURL(p)));
  }, [p]);
  return <img src={src} alt={`${p.title} UI`} loading="lazy" />;
}

export default function Projects() {
  const [active, setActive] = useState(-1);
  const pick = (i) => {
    const next = active === i ? -1 : i;
    world.selected = next; // the tall 3D monitor opens this project's real UI
    setActive(next);
  };
  useEffect(() => () => { world.selected = -1; }, []);

  return (
    <section id="projects" className="section right">
      <div className="panel wide">
        <Reveal>
          <p className="eyebrow on-sky">03 — Selected work</p>
        </Reveal>
        <SplitText className="title on-sky" text="Things I've built." />
        <p className="pick-hint">Click a project to open its real UI on the monitor.</p>
        <div className="cards">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 80, rotateX: 28, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.9, delay: (i % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 900 }}
            >
              <Tilt className={"card-wrap" + (active === i ? " active" : "")} max={7}>
                <article
                  className="card"
                  role="button"
                  tabIndex={0}
                  aria-pressed={active === i}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick(i))}
                >
                  <div className="thumb browser">
                    <div className="browser-bar">
                      <i /><i /><i />
                      <span>{p.host || p.title.toLowerCase()}</span>
                    </div>
                    <Preview p={p} />
                    <i className="shine" />
                    {active === i && <b className="on-monitor">● on monitor</b>}
                  </div>
                  <h3>{p.title}</h3>
                  <p className="tagline">{p.tag}</p>
                  <p>{p.blurb}</p>
                  <div className="chips small">
                    {p.stack.map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions">
                    <span className="show-btn">{active === i ? "Showing on monitor" : "Show on monitor"}</span>
                    <span className="card-links">
                      {p.live && (
                        <a className="card-link" href={p.live} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Live app ↗
                        </a>
                      )}
                      <a className="card-link" href={p.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        GitHub ↗
                      </a>
                    </span>
                  </div>
                </article>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
