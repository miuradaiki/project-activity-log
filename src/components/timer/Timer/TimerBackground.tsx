import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerBackgroundProps {
  isRunning: boolean;
}

export const TimerBackground: React.FC<TimerBackgroundProps> = ({
  isRunning,
}) => {
  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * 400,
                y: Math.random() * 200,
                scale: 0,
              }}
              animate={{
                x: Math.random() * 400,
                y: Math.random() * 200,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                position: 'absolute',
                width: 4 + Math.random() * 8,
                height: 4 + Math.random() * 8,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
