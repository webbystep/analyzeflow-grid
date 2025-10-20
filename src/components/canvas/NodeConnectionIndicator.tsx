import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface NodeConnectionIndicatorProps {
  isConnecting: boolean;
  isValid: boolean;
}

export function NodeConnectionIndicator({ isConnecting, isValid }: NodeConnectionIndicatorProps) {
  if (!isConnecting) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute inset-0 rounded-lg border-2 pointer-events-none ${
        isValid 
          ? 'border-green-500 bg-green-500/10' 
          : 'border-yellow-500 bg-yellow-500/10'
      }`}
    >
      {isValid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Check className="w-6 h-6 text-green-500" />
        </div>
      )}
    </motion.div>
  );
}
