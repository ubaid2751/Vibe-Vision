import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSliders, FiAlertTriangle, FiUser, FiInfo, FiSave, FiX, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import Chatbot from '../components/Chatbot';

// Add the hashCode function to String prototype
String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const LiveDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(10);
  const [emotion, setEmotion] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [allEmotions, setAllEmotions] = useState({});
  const intervalRef = useRef(null);
  const [emotionData, setEmotionData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New state for exit confirmation modal
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigatingTo = useRef(null);

  // Store max emotion values during the session
  const maxEmotionsRef = useRef({
    happy: 0,
    sad: 0,
    angry: 0,
    surprise: 0,
    fear: 0,
    disgust: 0,
    neutral: 0,
  });

  // Fetch user profile
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

  // Initialize webcam stream
  useEffect(() => {
    let canvas;
    let video;

    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
           video = videoRef.current;
           videoRef.current.onloadeddata = () => {
            canvas = canvasRef.current;
            captureAndSendFrame();
          };
        } else {
          console.error("VideoRef Didnt load");
        }
      } catch (err) {
        setError('Webcam access required - please enable camera permissions');
      }
    };

    enableStream();
    const stream = videoRef.current?.srcObject;
    return () => {
      if (stream) {
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle FPS changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 1000 / fps);

    return () => clearInterval(intervalRef.current);
  }, [fps]);

  // Add navigation interception
  useEffect(() => {
    // Intercept navigation actions
    const handleBeforeUnload = (e) => {
      const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);

      if (hasEmotionData) {
        e.preventDefault();
        return ;// Do not set returnValue to trigger default alert.
      }
      return undefined; // Allow navigation to proceed normally
    };

    // Intercept clicks on navigation links
    const handleLinkClick = (e) => {
      const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);

      if (hasEmotionData && e.target.tagName === 'A' && e.target.href) {
        e.preventDefault();
        navigatingTo.current = e.target.href;
        setShowExitConfirm(true);
      }
    };

    // Intercept button clicks that might navigate
    const handleButtonClick = (e) => {
      const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);
      const button = e.target.closest('button');

      if (hasEmotionData && button && button.dataset.navigate) {
        e.preventDefault();
        navigatingTo.current = button.dataset.navigate;
        setShowExitConfirm(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Attempt to trigger the exit confirmation when tab is hidden (e.g., switched)
        const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);
        if (hasEmotionData) {
          navigatingTo.current = null;  // Clear any pending navigation
          setShowExitConfirm(true);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('click', handleButtonClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const captureAndSendFrame = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas) {
      setIsLoading(false);
      console.error("Canvas element is null!");
      return null;
    }

    if (!video) {
      setIsLoading(false);
      console.error("Video element is null!");
      return null;
    }

    try {
      setIsLoading(true);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/jpeg', 0.1).split(',')[1];

      return new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas');
            setIsLoading(false);
            setError('Failed to process image');
            resolve(null);
            return;
          }

          const formData = new FormData();
          formData.append('image', blob, 'frame.jpg');

          try {
            const response = await axios.post(
              'http://127.0.0.1:5000/predict',
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (response.data.prediction) {
              const result = {
                emotion: response.data.prediction,
                confidence: (response.data.confidence * 100).toFixed(3),
                image: base64Image
              };

              setEmotion(result.emotion);
              setConfidence(result.confidence);

              // Update all emotions display
              if (response.data.all_emotions) {
                setAllEmotions(response.data.all_emotions);
              } else {
                const emotionsObj = {};
                emotionsObj[result.emotion.toLowerCase()] = parseFloat(result.confidence);
                setAllEmotions(emotionsObj);
              }

              setEmotionData(result);
              setError('');

              // Update max emotions
              const emotionKey = result.emotion.toLowerCase();
              maxEmotionsRef.current[emotionKey] = Math.max(
                maxEmotionsRef.current[emotionKey],
                parseFloat(result.confidence)
              );

              resolve(result);
            }
          } catch (error) {
            console.error('Error sending image to server:', error);
            setError('Analysis failed - server error');
            resolve(null);
          }
        }, 'image/jpeg'); // Specify MIME type
      });
    } catch (err) {
      console.error('Error in captureAndSendFrame:', err);
      setError('Analysis failed - please try again');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle manual saving of emotion data
  const handleSaveEmotions = async () => {
    setIsSaving(true);
    try {
      await saveMaxAnalysisHistory();
      setSaveSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving emotions:", error);
      setError("Failed to save emotion data");
    } finally {
      setIsSaving(false);
    }
  };

  const saveMaxAnalysisHistory = async () => {
    try {
      console.log("Saving emotion analysis data");
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, not saving analysis history.");
        return;
      }

      // Check if we have any emotion data worth saving
      const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);
      if (!hasEmotionData) {
        console.log("No emotion data to save");
        return;
      }

      // Create analysis data based on max emotions
      const analysisData = {
        emotions: Object.entries(maxEmotionsRef.current).reduce((obj, [emotion, value]) => {
          if (value > 0) {
            obj[emotion] = value;
          }
          return obj;
        }, {})
      };

      console.log("Saving max emotions:", analysisData);

      const response = await fetch("http://localhost:3000/user/save-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        console.error("Failed to save analysis history:", response.status);
        throw new Error("Server error when saving data");
      } else {
        console.log("Analysis history saved successfully!");
      }
    } catch (error) {
      console.error("Error saving analysis history:", error);
      throw error;
    }
  };

  // Handle confirm save and exit
  const handleConfirmSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await saveMaxAnalysisHistory();
      // Navigate to destination after saving
      if (navigatingTo.current) {
        window.location.href = navigatingTo.current;
      }
    } catch (error) {
      console.error("Error saving emotions before exit:", error);
      setError("Failed to save emotion data, but proceeding with exit");
      // Navigate anyway even if save failed
      if (navigatingTo.current) {
        window.location.href = navigatingTo.current;
      }
    } finally {
      setIsSaving(false);
      setShowExitConfirm(false);
    }
  };

  // Handle exit without saving
  const handleExitWithoutSaving = () => {
    if (navigatingTo.current) {
      window.location.href = navigatingTo.current;
    }
    setShowExitConfirm(false);
  };

  const getEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprise: '😲',
      fear: '😨',
      disgust: '🤢',
      neutral: '😐'
    };
    return emojis[emotion?.toLowerCase()] || '🤔';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'from-yellow-400 to-amber-500',
      sad: 'from-blue-400 to-indigo-500',
      angry: 'from-red-400 to-rose-500',
      surprise: 'from-purple-400 to-fuchsia-500',
      fear: 'from-teal-400 to-cyan-500',
      disgust: 'from-green-400 to-emerald-500',
      neutral: 'from-gray-400 to-slate-500'
    };
    return colors[emotion?.toLowerCase()] || 'from-indigo-400 to-purple-500';
  };

  // Check if we have any emotion data
  const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);

  // Custom data-navigate attribute for the dashboard button
  const handleBackToDashboard = (e) => {
    e.preventDefault();
    const hasEmotionData = Object.values(maxEmotionsRef.current).some(val => val > 0);

    if (hasEmotionData) {
      navigatingTo.current = "/dashboard";
      setShowExitConfirm(true);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900 flex flex-col items-center p-4 md:p-6 relative overflow-hidden">
      {/* Enhanced Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-indigo-900/20 rounded-full filter blur-3xl transform -translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-purple-900/20 rounded-full filter blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-blue-900/20 rounded-full filter blur-3xl"></div>

        {/* Dynamic Particles with improved animation */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              opacity: Math.random() * 0.5 + 0.1,
              scale: Math.random() * 0.6 + 0.4,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, Math.random() * 0.5 + 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 5 + 1}px`,
              height: `${Math.random() * 5 + 1}px`,
              background: `rgba(${Math.floor(Math.random() * 100) + 150}, ${Math.floor(
                Math.random() * 100
              ) + 150}, ${Math.floor(Math.random() * 155) + 150}, ${
                Math.random() * 0.4 + 0.1
              })`,
            }}
          />
        ))}
      </div>

      {/* Enhanced Top Navigation Bar */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-lg rounded-xl p-3 flex items-center justify-between border border-white/10 mb-6 z-10 shadow-lg shadow-indigo-900/20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-100 px-3 py-2 rounded-lg border border-indigo-400/30 transition-all duration-200 shadow-md shadow-indigo-900/20"
          onClick={handleBackToDashboard}
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </motion.button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent hidden md:block filter drop-shadow-md">
          Image Emotion Analysis
        </h1>

        {/* Enhanced User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm text-white font-medium">{user?.name || "Guest User"}</p>
            <p className="text-xs text-indigo-200/70">{user?.email || "Sign in to save results"}</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer border border-indigo-400/30 shadow-lg shadow-indigo-900/30"
          >
            {user?.name ? (
              <span className="text-white font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <FiUser className="w-4 h-4 text-white" />
            )}
          </motion.div>
        </div>
      </div>

      <div className="relative h-[700px] z-10 w-full max-w-6xl flex flex-col md:flex-row gap-6 justify-end">
        {/* Chatbot Section */}
        <div className="h-full w-full md:w-4/5 flex-shrink-0 order-1 md:order-0">
          <div className="h-full bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden h-full w-full flex flex-col shadow-xl shadow-indigo-900/20">
            <Chatbot emotionData={emotionData} />
          </div>
        </div>

        {/* Main Content Row */}
        <div className="w-full md:w-2/5 flex flex-col gap-4 order-0 md:order-1">
          {/* Enhanced Video Feed and Analysis */}
          <div className="flex-1 max-h-[300px]">
            {/* Video Container with enhanced styling */}
            <div className="relative group h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-[#0c0c20] rounded-xl overflow-hidden h-full border border-white/10 shadow-inner shadow-black/30">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {/* Enhanced Status Indicators */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full min-w-[70px] justify-center border border-white/10 shadow-md">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-xs font-medium text-white">{isLoading ? 'Processing' : 'Live'}</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full min-w-[60px] flex justify-center border border-white/10 shadow-md">
                    <span className="text-xs font-medium text-white">{fps} FPS</span>
                  </div>
                </div>

                {/* Enhanced Emotion Result Display */}
                <AnimatePresence>
                  {emotion && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br ${getEmotionColor(emotion)} shadow-lg shadow-black/30 border border-white/20`}>
                          <span className="text-xl">{getEmoji(emotion)}</span>
                        </div>
                        <div>
                          <p className="text-xs text-indigo-300 uppercase tracking-wider font-bold">Detected Emotion</p>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-white capitalize">{emotion}</p>
                            <div className="flex items-center px-2 py-0.5 bg-white/10 rounded-full border border-white/20">
                              <span className="text-xs font-medium text-white/90">{confidence}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Loading Overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          animate={{
                            rotate: 360,
                            borderRadius: ["50% 50% 50% 50%", "40% 60% 60% 40%", "50% 50% 50% 50%"],
                          }}
                          transition={{
                            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                            borderRadius: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className="w-7 h-7 border-2 border-indigo-400 border-t-transparent shadow-md"
                        />
                        <p className="text-xs text-indigo-300 mt-2 font-medium">Analyzing...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Enhanced Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 p-3 bg-red-500/15 border border-red-400/30 rounded-lg flex items-center gap-2 text-xs shadow-md"
                >
                  <FiAlertTriangle className="text-red-400 text-sm flex-shrink-0" />
                  <span className="text-red-200">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Settings Panel */}
          <div className="w-full max-w-full">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg shadow-indigo-900/20">
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
                <h3 className="font-semibold text-white text-sm">Analysis Settings</h3>
                <p className="text-indigo-200/70 text-xs">Configure the detection parameters</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Enhanced FPS Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiSliders className="text-indigo-300 text-sm" />
                      <label className="block text-xs text-gray-200 font-medium">Analysis Rate</label>
                    </div>
                    <div
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <FiInfo className="text-indigo-300 text-xs cursor-help" />
                      {showTooltip && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-gray-800 rounded-md text-xs text-gray-300 shadow-lg z-10 border border-indigo-500/30">
                          Higher FPS provides more responsive analysis but may consume more resources.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="range"
                      min="1"
                      max="32"
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      className="w-full h-2 appearance-none bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg cursor-pointer"
                      style={{
                        backgroundSize: `${fps * 10}% 100%`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Low</span>
                      <span className="text-indigo-200 font-medium">{fps} FPS</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
                
                {/* Emotion Legend */}
                <div className="space-y-1 pt-3 border-t border-white/10">
                  <h4 className="text-xs text-gray-300 font-medium mb-2">Emotion Legend</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {['Angry','Disgust','Fear','Happy','Neutral', 'Sad', 'Surprise'].map((emo) => (
                      <div key={emo} className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${getEmotionColor(emo)}`}>
                            <span className="text-xs">{getEmoji(emo)}</span>
                          </div>
                          <span className="text-xs text-gray-300">{emo}</span>
                        </div>
                        <span className="text-xs text-indigo-300 font-medium">
                          {allEmotions[emo.toLowerCase()] ? 
                            `${(allEmotions[emo.toLowerCase()]).toFixed(1)}%` : 
                            '0%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Save Button */}
            {/* {hasEmotionData && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`mt-3 flex items-center justify-center w-full ${
                  saveSuccess
                    ? "bg-emerald-600/30 text-emerald-200 border-emerald-400/30"
                    : "bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-100 border-indigo-400/30"
                } px-4 py-3 rounded-lg border transition-all duration-300 shadow-md shadow-indigo-900/20`}
                onClick={handleSaveEmotions}
                disabled={isSaving || saveSuccess}
              >
                {saveSuccess ? (
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <FiSave className="w-5 h-5 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {isSaving
                    ? "Saving..."
                    : saveSuccess
                      ? "Saved Successfully!"
                      : "Save Emotion Analysis"}
                </span>
              </motion.button>
            )} */}
          </div>
        </div>
      </div>

      {/* Redesigned Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-gray-900 border border-indigo-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5 border border-indigo-500/30">
                  <FiAlertTriangle className="text-indigo-300 w-8 h-8" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">Save Your Progress?</h3>

                <p className="text-indigo-200 mb-6 leading-relaxed">
                  Your emotion analysis data hasn't been saved. Would you like to save your results before continuing to the dashboard?
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-300 shadow-lg shadow-indigo-900/30 border border-indigo-400/20"
                    onClick={handleConfirmSaveAndExit}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Analysis...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FiSave className="mr-2" />
                        Save & Continue
                      </span>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium border border-gray-700 transition-all duration-300 shadow-md"
                    onClick={handleExitWithoutSaving}
                    disabled={isSaving}
                  >
                    <span className="flex items-center justify-center">
                      <FiX className="mr-2" />
                      Exit Without Saving
                    </span>
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 py-2 px-4 rounded-xl bg-transparent hover:bg-gray-800/50 text-indigo-300 text-sm transition-all duration-300 border border-transparent hover:border          border-indigo-500/20"
                  onClick={() => setShowExitConfirm(false)}
                  disabled={isSaving}
                >
                  Cancel & Continue Analyzing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default LiveDetection;