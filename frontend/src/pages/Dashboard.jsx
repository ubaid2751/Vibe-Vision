import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSettings,
  FiLogOut,
  FiHome,
  FiInfo
} from "react-icons/fi";

// Custom icon components for uniform style
const DetectionIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M20 12h2" />
    <path d="M2 12h2" />
  </svg>
);

const VideoIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M10 10l5 3-5 3v-6z" />
  </svg>
);

const HistoryIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Generate consistent gradient colors based on text
const generateGradient = (text) => {
  const hash = text.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  
  return `hsl(${h1}, 80%, 60%), hsl(${h2}, 80%, 50%)`;
};

const Dashboard = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hoverState, setHoverState] = useState(null);

  // Pulse animation for the logo
  const logoVariants = {
    animate: {
      filter: ["drop-shadow(0 0 6px rgba(138, 43, 226, 0.4))", "drop-shadow(0 0 12px rgba(138, 43, 226, 0.7))", "drop-shadow(0 0 6px rgba(138, 43, 226, 0.4))"],
      scale: [1, 1.02, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Card animations with hover effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 70,
        damping: 15
      } 
    }
  };

  // Floating effect for background elements
  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Sidebar hover effect for menu items
  const menuItemVariants = {
    hover: {
      x: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Feature cards data with uniform icons
  const featureCards = [
    {
      title: "Image Analysis",
      description: "Analyze images for object detection and classification",
      icon: <DetectionIcon className="w-6 h-6" />,
      path: "/detect-image",
      color: "indigo"
    },
    {
      title: "Live Detection",
      description: "Real-time video analysis and monitoring",
      icon: <VideoIcon className="w-6 h-6" />,
      path: "/detect-live",
      color: "purple"
    },
    {
      title: "Analysis History",
      description: "View and analyze your past detection results",
      icon: <HistoryIcon className="w-6 h-6" />,
      path: "/history",
      color: "emerald"
    },
    {
      title: "About Us",
      description: "Learn more about VibeVision technology and our team",
      icon: <FiInfo className="w-6 h-6" />,
      path: "/about",
      color: "blue"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#080818] overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Animated gradient blobs */}
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[100px] rounded-full"
        ></motion.div>
        <motion.div 
          variants={floatingVariants}
          animate="animate"
          custom={1}
          className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-500/10 blur-[100px] rounded-full"
          style={{ animationDelay: "-3s" }}
        ></motion.div>
      </div>

      {/* Ambient light lines */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          animate={{ 
            y: ["0%", "100%"], 
            opacity: [0, 0.8, 0] 
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute top-0 left-0 h-full w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent"
          animate={{ 
            x: ["0%", "100%"], 
            opacity: [0, 0.8, 0] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
      </div>

      {/* Sidebar with enhanced animations */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.nav
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-[#1a1a3f]/95 to-[#0a0a2f]/95 backdrop-blur-md z-50 flex flex-col justify-between p-6 border-r border-white/10"
          >
            <div>
              {/* Logo with pulse animation */}
              <motion.div 
                className="mb-8 text-2xl font-bold text-center"
                variants={logoVariants}
                animate="animate"
              >
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  VibeVision
                </span>
              </motion.div>
              
              {/* User Profile with hover animation */}
              <motion.div 
                className="flex items-center gap-4 mb-8 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${generateGradient(user?.name || "Guest")})` 
                  }}
                >
                  <span className="text-xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user?.name || "Guest"}
                  </h3>
                  <p className="text-gray-400 text-sm">{user?.email || "guest@example.com"}</p>
                </div>
              </motion.div>

              {/* Navigation with animated indicators */}
              <div className="space-y-1">
                <motion.div
                  variants={menuItemVariants}
                  whileHover="hover"
                >
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition-all relative overflow-hidden"
                    onClick={() => {setActiveTab("dashboard"); setIsSidebarOpen(false)}}
                    onMouseEnter={() => setHoverState("dashboard")}
                    onMouseLeave={() => setHoverState(null)}
                  >
                    <div className={`p-2 bg-indigo-500/20 rounded-lg ${activeTab === "dashboard" ? "bg-indigo-500/40" : ""}`}>
                      <FiHome className="text-indigo-300 w-5 h-5" />
                    </div>
                    <span>Dashboard</span>
                    {activeTab === "dashboard" && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-full" 
                      />
                    )}
                    {hoverState === "dashboard" && activeTab !== "dashboard" && (
                      <motion.div 
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-400/40 rounded-full" 
                      />
                    )}
                  </Link>
                </motion.div>

                {featureCards.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={menuItemVariants}
                    whileHover="hover"
                  >
                    <Link
                      to={feature.path}
                      className="flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition-all relative overflow-hidden"
                      onClick={() => {setActiveTab(feature.path.substring(1)); setIsSidebarOpen(false)}}
                      onMouseEnter={() => setHoverState(feature.path.substring(1))}
                      onMouseLeave={() => setHoverState(null)}
                    >
                      <div className={`p-2 bg-${feature.color}-500/20 rounded-lg ${activeTab === feature.path.substring(1) ? `bg-${feature.color}-500/40` : ""}`}>
                        {feature.icon}
                      </div>
                      <span>{feature.title}</span>
                      {activeTab === feature.path.substring(1) && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-${feature.color}-400 rounded-full`} 
                        />
                      )}
                      {hoverState === feature.path.substring(1) && activeTab !== feature.path.substring(1) && (
                        <motion.div 
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0 }}
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-${feature.color}-400/40 rounded-full`} 
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer with hover animations */}
            <div className="space-y-2">
              <motion.button
                variants={menuItemVariants}
                whileHover="hover"
                onClick={() => navigate("/account")}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-white/5 transition-all group"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FiSettings className="text-blue-300 w-5 h-5" />
                </div>
                <span>Account Settings</span>
              </motion.button>

              <motion.button
                variants={menuItemVariants}
                whileHover="hover"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-red-300 hover:bg-red-500/10 transition-all group"
              >
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                  <FiLogOut className="w-5 h-5" />
                </div>
                <span>Log Out</span>
              </motion.button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={`relative z-10 transition-all duration-300 ${
          isSidebarOpen ? "pl-72" : ""
        }`}
      >
        {/* Header with animated transitions */}
        <motion.header 
          layout
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a2f]/90 backdrop-blur-md"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSidebarOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="hidden md:block text-sm text-gray-400"
              >
                <span>Dashboard</span>
                {activeTab !== "dashboard" && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="capitalize">{activeTab.replace('-', ' ')}</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            variants={logoVariants}
            animate="animate"
            className="hidden md:block text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
          >
            VibeVision
          </motion.div>

          {/* User Profile with status indicator */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <motion.div 
                animate={{ 
                  boxShadow: [
                    "0 0 0 rgba(74, 222, 128, 0.4)", 
                    "0 0 8px rgba(74, 222, 128, 0.8)", 
                    "0 0 0 rgba(74, 222, 128, 0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-[#0a0a2f]"
              />
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                style={{ 
                  background: `linear-gradient(135deg, ${generateGradient(user?.name || "Guest")})` 
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>
            <AnimatePresence>
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                className="hidden md:block text-sm text-gray-300"
              >
                {user?.name || "Guest"}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </motion.header>

        {/* Content Area with animated transitions between pages */}
        <AnimatePresence mode="wait">
          <motion.main 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {children || (
              <div>
                {/* Welcome Message with typing animation */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <h1 className="text-2xl font-bold text-white mb-1">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      Welcome back, {user?.name || "Guest"}
                    </motion.span>
                  </h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-gray-400"
                  >
                    Here's your VibeVision dashboard overview
                  </motion.p>
                </motion.div>
                
                {/* Feature Cards with enhanced animations */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {featureCards.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      whileHover={{ 
                        y: -8, 
                        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.2)`,
                        backgroundColor: "#181840" 
                      }}
                      className="rounded-xl cursor-pointer transition-all duration-300 overflow-hidden relative"
                      onClick={() => navigate(feature.path)}
                    >
                      {/* Card gradient border */}
                      <div className="absolute inset-0 p-[1px] rounded-xl z-0">
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${feature.color}-500/40 via-${feature.color}-500/10 to-transparent`}></div>
                      </div>
                      
                      {/* Card content */}
                      <div className="relative z-10 bg-[#0f0f2f] rounded-xl p-5 h-full flex flex-col">
                        <motion.div 
                          whileHover={{ rotate: 5 }}
                          className={`w-12 h-12 rounded-lg bg-${feature.color}-500/20 flex items-center justify-center text-${feature.color}-300 mb-4`}
                        >
                          {feature.icon}
                        </motion.div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-sm flex-grow">
                          {feature.description}
                        </p>
                        
                        {/* Animated arrow indicator */}
                        <motion.div 
                          className="flex justify-end mt-4"
                          initial={{ opacity: 0.4 }}
                          whileHover={{ 
                            x: 5, 
                            opacity: 1,
                            transition: { duration: 0.2 } 
                          }}
                        >
                          <svg 
                            className={`w-5 h-5 text-${feature.color}-400`} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14"></path>
                            <path d="M12 5l7 7-7 7"></path>
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{ 
              opacity: 0.2,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: `hsl(${220 + Math.random() * 60}, 90%, 70%)`,
              filter: `blur(1px)`,
              boxShadow: `0 0 ${Math.random() * 8 + 2}px hsl(${220 + Math.random() * 60}, 90%, 70%)`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;