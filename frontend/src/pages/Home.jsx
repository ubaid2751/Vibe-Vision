import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import featureImage from "../assets/image-4 1.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a1f] flex justify-center items-center p-5">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzM4NmYiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: Math.random() * 360
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 200 - 100, 0],
              scale: [1, 0.5, 1],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg className="w-16 h-16" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d={i % 3 === 0 ? "M12,2L2,7L12,12L22,7L12,2M2,17L12,22L22,17L12,12L2,17M2,12L12,17L22,12L12,7L2,12Z" : "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"}
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Main Content Container */}
      <motion.div 
        className="relative z-30 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center px-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* Text Content */}
        <div className="space-y-8">
          {/* Animated Header */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <Logo size="xl" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
                Emotion Intelligence
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Redefined
              </span>
            </h1>
          </motion.div>

          {/* Enhanced Description */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover our innovative AI solution for emotion recognition. 
            We're developing cutting-edge technology to understand human emotions 
            through advanced machine learning models.
          </motion.p>

          {/* CTAs with Hover Effects */}
          <motion.div 
            className="flex gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-4 text-lg font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl hover:shadow-indigo-500/30 transition-all"
              onClick={() => navigate("/signup")}
            >
              <span className="relative z-10">Get Started Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-20 rounded-xl transition-opacity" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-lg font-semibold border-2 border-indigo-500/30 rounded-xl hover:border-indigo-400/60 hover:bg-indigo-500/10 transition-all"
              onClick={() => navigate("/about")}
            >
              About Us
            </motion.button>
          </motion.div>

          {/* Stats Grid - Updated for Development Phase */}
          <motion.div 
            className="grid grid-cols-3 gap-8 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { value: "Deep Learning", label: "Technology" },
              { value: "Real-time", label: "Analysis" },
              { value: "Multi-factor", label: "Detection" }
            ].map((stat, index) => (
              <div key={index} className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Feature Visualization */}
        <motion.div 
          className="relative hidden lg:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-3xl" />
          
          <div className="relative z-10">
            <img
              src={featureImage}
              alt="AI Analytics Interface"
              className="w-full h-auto object-contain transform rotate-3d"
            />
            
            {/* Floating Tech Overlay */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-8">
              {[
                 { icon: "😊", value: "92%", label: "Happiness" },
                 { icon: "😢", value: "88%", label: "Sadness" },
                 { icon: "😠", value: "85%", label: "Anger" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-4 bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl"
                  whileHover={{ y: -10 }}
                >
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-xl font-bold mt-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Animated Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-8 h-12 rounded-full border-2 border-indigo-400 flex items-center justify-center">
          <div className="w-1 h-4 bg-indigo-400 rounded-full animate-scroll" />
        </div>
      </motion.div>
    </div>
  );
};

export default Home;