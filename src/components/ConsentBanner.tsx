import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ambition_tracking_consent");
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("ambition_tracking_consent", "true");
    setShow(false);
    window.location.reload(); // Reload to start tracking
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 z-[99] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-muted-foreground max-w-2xl">
            We use analytics to improve your experience. By accepting, you consent to geolocation tracking as per our privacy policy.
          </p>
          <div className="flex gap-4">
            <button onClick={accept} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-xs uppercase">Accept</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
