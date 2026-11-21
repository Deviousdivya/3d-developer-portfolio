import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Cycles through words with a blur/slide transition.
export default function FlipWords({ words, interval = 2600 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="flip">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          className="flip-word"
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
