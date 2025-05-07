import { motion } from "framer-motion";
import { FiTool } from "react-icons/fi";

const UnderDevelopment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] to-[#1a1a2f] flex items-center justify-center p-5">
      {/* Construction Sign */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 max-w-md"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
          className="text-5xl mb-4"
        >
          🚧
        </motion.div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent mb-3">
          Under Development
        </h1>
        
        <p className="text-gray-400 mb-6">
          We're working hard to bring this feature to you!
        </p>
        
        <div className="flex items-center justify-center text-indigo-400">
          <FiTool className="mr-2" />
          <span>Please check back soon</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UnderDevelopment;