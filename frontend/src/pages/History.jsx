import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiClock,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiTrendingUp
} from 'react-icons/fi';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [user, setUser] = useState(null);

  const emotionColors = {
    happy: '#FBBF24',
    sad: '#3B82F6',
    angry: '#EF4444',
    surprised: '#A855F7',
    fearful: '#06B6D4',
    disgusted: '#10B981',
    neutral: '#64748B'
  };

  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fearful: '😨',
    disgusted: '🤢',
    neutral: '😐'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Fetch user profile
        const userResponse = await fetch('http://localhost:3000/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch analysis history
        const historyResponse = await fetch('http://localhost:3000/user/analysis-history', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!historyResponse.ok) {
          console.error('Failed to fetch analysis history. Status:', historyResponse.status);
          try {
            const errorBody = await historyResponse.json();
            throw new Error(errorBody.message || 'Failed to fetch analysis history');
          } catch (parseError) {
            throw new Error('Failed to fetch analysis history');
          }
        }

        const historyData = await historyResponse.json();
        // Sort history by timestamp (newest first)
        const sortedHistory = historyData.sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setHistory(sortedHistory);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredHistory = () => {
    const now = new Date();

    return history.filter(entry => {
      const entryDate = new Date(entry.timestamp);

      switch (timeRange) {
        case 'week':
          return now - entryDate <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return now - entryDate <= 30 * 24 * 60 * 60 * 1000;
        case 'year':
          return now - entryDate <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  };

  const filteredHistory = getFilteredHistory();

  // Get emotion trends (average value for each emotion in the time period)
  const getEmotionTrends = () => {
    if (filteredHistory.length === 0) return [];

    const emotionSums = {};
    const emotionCounts = {};

    filteredHistory.forEach(entry => {
      if (entry.emotions && typeof entry.emotions === 'object') {
        Object.entries(entry.emotions).forEach(([emotion, value]) => {
          emotionSums[emotion] = (emotionSums[emotion] || 0) + value;
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    return Object.keys(emotionSums).map(emotion => ({
      name: emotion,
      value: emotionSums[emotion] / emotionCounts[emotion],
      color: emotionColors[emotion] || '#64748B'
    })).sort((a, b) => b.value - a.value);
  };

  const emotionTrends = getEmotionTrends();

  // Function to get dominant emotion from an entry
  const getDominantEmotion = (entry) => {
    if (!entry.emotions || typeof entry.emotions !== 'object') return "N/A";

    const entries = Object.entries(entry.emotions);
    if (entries.length === 0) return "N/A";

    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  // Get emotion stats
  const getEmotionStats = () => {
    if (filteredHistory.length === 0) return {};

    const dominantEmotions = filteredHistory.map(entry => getDominantEmotion(entry));
    const emotionCounts = {};

    dominantEmotions.forEach(emotion => {
      if (emotion !== "N/A") {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    const totalCount = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);

    const stats = {};
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      stats[emotion] = {
        count,
        percentage: Math.round((count / totalCount) * 100)
      };
    });

    return stats;
  };

  const emotionStats = getEmotionStats();

  // Get emotion key insights
  const getKeyInsights = () => {
    if (filteredHistory.length === 0) return [];

    const insights = [];
    const stats = getEmotionStats();

    // Most frequent emotion
    const mostFrequentEntry = Object.entries(stats).sort((a, b) => b[1].count - a[1].count)[0];
    if (mostFrequentEntry) {
      const mostFrequentEmotion = mostFrequentEntry[0];
      insights.push({
        title: "Most Frequent",
        emotion: mostFrequentEmotion,
        value: `${mostFrequentEntry[1].percentage}%`,
        color: emotionColors[mostFrequentEmotion] || '#64748B',
        emoji: emotionEmojis[mostFrequentEmotion.trim().toLowerCase()] || '🤔'  // Get the emoji for the actual emotion
      });
    }

    // Highest intensity emotion (average)
    const highestIntensity = emotionTrends[0];
    if (highestIntensity) {
      insights.push({
        title: "Highest Intensity",
        emotion: highestIntensity.name,
        value: `${Math.round(highestIntensity.value)}%`,
        color: highestIntensity.color,
        emoji: emotionEmojis[highestIntensity.name.trim().toLowerCase()] || '🤔' // Get the emoji for the actual emotion
      });
    }

    return insights;
  };

  const keyInsights = getKeyInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-indigo-900/20 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-900/20 rounded-full filter blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
      </div>

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
          Emotion Analysis History
        </h1>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm text-white font-medium">{user?.name || "Guest User"}</p>
            <p className="text-xs text-gray-400">{user?.email || "Sign in to view history"}</p>
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

      <div className="relative z-10 w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiTrendingUp className="text-indigo-400" />
            Your Emotion Insights
          </h2>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-lg p-1 border border-white/10">
            {['week', 'month', 'year', 'all'].map(range => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-1 text-xs rounded-md capitalize ${timeRange === range ? 'bg-indigo-600/30 text-white' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </motion.button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-2">
            <FiAlertCircle className="text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-300">Loading your analysis history...</p>
          </div>
        ) : (
          <>
            {filteredHistory.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
                <FiAlertCircle className="text-indigo-400 w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Analysis Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  No emotion analysis records found for the selected time period. Try selecting a different time range or perform a new analysis.
                </p>
              </div>
            ) : (
              <>
                {/* Key Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {keyInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${insight.color}30`, borderColor: insight.color }}>
                        {/* Insert Emoji Here */}
                        <span className="text-3xl">{insight.emoji}</span>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">{insight.title}</p>
                        <h3 className="text-white text-xl font-bold capitalize">{insight.emotion}</h3>
                        <p className="text-indigo-300">{insight.value} of responses</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Emotion Stats - REMOVED */}

                {/* Recent Analysis */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <FiClock className="text-indigo-400" />
                      Recent Analysis
                    </h3>
                    <p className="text-xs text-gray-400">{filteredHistory.length} records</p>
                  </div>

                  <div className="space-y-3">
                    {filteredHistory.map((entry, index) => {
                      const dominantEmotion = getDominantEmotion(entry);
                      const emotionEntries = Object.entries(entry.emotions || {}); // Ensure `entry.emotions` is an object

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-gray-400 text-sm" />
                              <span className="text-xs text-gray-300">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div
                              className="text-xs px-2 py-1 rounded-full capitalize font-medium"
                              style={{
                                backgroundColor: `${emotionColors[dominantEmotion]}20`,
                                color: emotionColors[dominantEmotion]
                              }}
                            >
                              {dominantEmotion}
                            </div>
                          </div>
                          
                          {/* Container for a Single Emotion - Aligned Centered */}
                          {emotionEntries.length === 1 ? (
                            <div className="flex justify-center items-center">
                              {emotionEntries.map(([emotion, value]) => (
                                <div key={emotion} className="text-center">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-300 capitalize">{emotion}</span>
                                    <span className="text-gray-400">{value}%</span>
                                  </div>
                                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${value}%`,
                                        backgroundColor: emotionColors[emotion]
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {emotionEntries
                                .sort((a, b) => b[1] - a[1])
                                .map(([emotion, value]) => (
                                  <div key={emotion} className="flex-1">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-gray-300 capitalize">{emotion}</span>
                                      <span className="text-gray-400">{value}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${value}%`,
                                          backgroundColor: emotionColors[emotion]
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;