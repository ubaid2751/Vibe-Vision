import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiUpload,
  FiAlertCircle,
  FiBarChart2,
  FiRefreshCw,
  FiUser,
  FiInfo,
  FiImage,
} from "react-icons/fi";

// Add the hashCode function to String prototype
String.prototype.hashCode = function () {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const ImageDetection = () => {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const emotionDescriptions = {
    happy:
      "The subject appears to be expressing joy or happiness, indicated by facial features like a smile or raised cheeks.",
    sad:
      "The subject appears to be expressing sadness, possibly indicated by a downturned mouth or lowered eyebrows.",
    angry:
      "The subject appears to be expressing anger, indicated by features like furrowed brows or a tense expression.",
    surprised:
      "The subject appears to be expressing surprise, typically shown through raised eyebrows and widened eyes.",
    fearful:
      "The subject appears to be expressing fear, often indicated by widened eyes and a tense facial expression.",
    disgusted:
      "The subject appears to be expressing disgust, shown through features like a wrinkled nose or raised upper lip.",
    neutral:
      "The subject appears to have a neutral expression with minimal emotional indicators.",
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, user is a guest.");
        setUser(null);
        return;
      }
      const response = await fetch("http://localhost:3000/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        console.error("Failed to fetch profile:", response.status);
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    setIsLoading(true);
    setProgress(0);
    setPrediction(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();
        setPrediction(result);
        if (user?.email) {
          await saveAnalysisHistory(result);
        }
      } else {
        setPrediction({ error: "Failed to analyze the file." });
      }
    } catch (error) {
      setPrediction({ error: "An error occurred while uploading the file." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const saveAnalysisHistory = async (analysisResult) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, not saving analysis history.");
        return;
      }

      const analysisData = {
        emotions: { [analysisResult.prediction]: analysisResult.confidence }, // Structure as { happy: 0.8, sad: 0.2 }

      };

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
      } else {
        console.log("Analysis history saved successfully!");
      }
    } catch (error) {
      console.error("Error saving analysis history:", error);
    }
  };

  const resetAnalysis = () => {
    setPrediction(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getEmoji = (emotion) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      surprised: "😲",
      fearful: "😨",
      disgusted: "🤢",
      neutral: "😐",
    };
    return emojis[emotion?.toLowerCase()] || "🤔";
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: "from-yellow-400 to-amber-500",
      sad: "from-blue-400 to-indigo-500",
      angry: "from-red-400 to-rose-500",
      surprised: "from-purple-400 to-fuchsia-500",
      fearful: "from-teal-400 to-cyan-500",
      disgusted: "from-green-400 to-emerald-500",
      neutral: "from-gray-400 to-slate-500",
    };
    return colors[emotion?.toLowerCase()] || "from-indigo-400 to-purple-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900  flex flex-col items-center p-4 md:p-6 relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-indigo-900/20 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-900/20 rounded-full filter blur-3xl transform translate-x-1/4 translate-y-1/4"></div>

        {/* Dynamic Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              opacity: Math.random() * 0.5 + 0.1,
              scale: Math.random() * 0.5 + 0.5,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, Math.random() * 0.5 + 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `rgba(${Math.floor(Math.random() * 100) + 100}, ${
                Math.floor(Math.random() * 100) + 100
              }, ${Math.floor(Math.random() * 155) + 100}, ${
                Math.random() * 0.3 + 0.1
              })`,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl bg-white/5 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/10 mb-6 z-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 px-3 py-2 rounded-lg border border-indigo-400/20 transition-all duration-200"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <FiArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </motion.button>

        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent hidden md:block">
          Image Emotion Analysis
        </h1>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm text-white font-medium">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs text-gray-400">
              {user?.email || "Sign in to save results"}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer border border-indigo-400/30 shadow-lg shadow-indigo-900/20"
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

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 h-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mb-2">
                Emotion Detection
              </h2>
              <p className="text-gray-400 text-sm">
                Upload an image to analyze facial expressions
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!previewUrl ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    type="file"
                    onChange={handleUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*"
                  />

                  <motion.label
                    htmlFor="file-upload"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="block group relative overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-video border-2 border-dashed border-indigo-500/30 rounded-xl flex flex-col items-center justify-center transition-all hover:border-indigo-400/60 bg-indigo-500/5">
                      <div className="p-6 flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <FiUpload className="text-2xl text-indigo-400" />
                        </div>
                        <div className="text-center">
                          <div className="text-indigo-300 text-lg font-medium mb-1">
                            Select an image
                          </div>
                          <p className="text-sm text-gray-400">
                            JPG, PNG, or JPEG (Max 5MB)
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded-lg border border-indigo-500/30 text-sm mt-2"
                        >
                          Browse Files
                        </motion.button>
                      </div>
                    </div>
                  </motion.label>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-70 blur-md group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-[#0c0c20] rounded-lg overflow-hidden aspect-video border border-white/5">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />

                    {/* File info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center gap-2">
                        <FiImage className="text-indigo-300" />
                        <span className="text-sm text-white font-medium truncate">
                          {selectedFile?.name}
                        </span>
                      </div>
                    </div>

                    {/* Upload progress */}
                    <AnimatePresence>
                      {progress > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center justify-center space-x-3 bg-indigo-500/10 rounded-lg p-3"
                >
                  <div className="relative">
                    <div className="w-8 h-8 border-3 border-indigo-500/30 rounded-full"></div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full"
                    />
                  </div>
                  <span className="text-indigo-300 font-medium">
                    Analyzing image...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {prediction?.error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-3"
                >
                  <FiAlertCircle className="text-red-400 text-lg flex-shrink-0" />
                  <div>
                    <p className="text-red-300 font-medium">
                      {prediction.error}
                    </p>
                    <p className="text-red-200/70 text-sm mt-1">
                      Please try again with a different image.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {prediction && !prediction.error && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full md:w-96 flex-shrink-0"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden h-full">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white text-lg">
                      Analysis Results
                    </h3>
                    <div
                      className="relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <FiInfo className="text-gray-400 text-sm cursor-help" />
                      {showTooltip && (
                        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-gray-800 rounded-md text-xs text-gray-300 shadow-lg z-10">
                          Results are based on AI analysis of facial expressions
                          in the image.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Primary Emotion Display */}
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-24 h-24 rounded-full bg-gradient-to-br ${getEmotionColor(
                        prediction.prediction
                      )} flex items-center justify-center`}
                    >
                      <span className="text-5xl">
                        {getEmoji(prediction.prediction)}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-indigo-300 uppercase tracking-wider font-medium">
                      Primary Emotion
                    </p>
                    <h3 className="text-2xl font-bold text-white capitalize mt-1">
                      {prediction.prediction}
                    </h3>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-300 font-medium">
                        Confidence Score
                      </p>
                      <p className="text-sm font-bold text-white">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.confidence * 100}%` }}
                        className={`h-full bg-gradient-to-r ${getEmotionColor(
                          prediction.prediction
                        )}`}
                      />
                    </div>
                  </div>

                  {/* What This Means Section */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-gray-300 font-medium mb-2">
                      What This Means
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {
                        emotionDescriptions[
                          prediction.prediction.toLowerCase()
                        ] ||
                        "The AI has detected facial features but couldn't determine a specific emotion with high confidence."
                      }
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetAnalysis}
                      className="w-full py-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded-lg border border-indigo-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Analyze New Image</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons When No Analysis */}
      <AnimatePresence>
        {previewUrl && !prediction && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="z-10 mt-4 flex gap-4 w-full max-w-4xl"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAnalysis}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 flex items-center justify-center gap-2"
            >
              <FiUpload className="w-4 h-4" />
              <span>Choose Different Image</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                handleUpload({ target: { files: [selectedFile] } })
              }
              className="flex-1 py-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded-lg border border-indigo-500/30 flex items-center justify-center gap-2"
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Analyze Image</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageDetection;