import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaImage, FaPlus, FaLightbulb } from 'react-icons/fa';
import './Chatbot.css';

const Chatbot = ({ emotionData }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [currentEmotion, setCurrentEmotion] = useState(null);
    const [currentConfidence, setCurrentConfidence] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);
    const [useLiveDetection, setUseLiveDetection] = useState(true);
    const [showPredefinedQueries, setShowPredefinedQueries] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (emotionData) {
            // console.log("Received emotionData:", emotionData);
            
            // Only update states if emotionData contains valid data
            if (emotionData.emotion) setCurrentEmotion(emotionData.emotion);
            if (emotionData.confidence) setCurrentConfidence(emotionData.confidence);
            if (emotionData.image) {
                // console.log("Image data received, length:", emotionData.image.length);
                setCurrentImage(emotionData.image);
                
                // If we receive new emotion data and useLiveDetection is true,
                // we can optionally auto-update the preview
                if (useLiveDetection) {
                    setSelectedImage(null); // Clear any manually selected image
                    setShowImagePreview(true);
                }
            }
        }
    }, [emotionData, useLiveDetection]);

    // Determine which image to use for the API request
    const getImageForRequest = () => {
        // Priority: manually selected image > camera captured image (if live detection enabled)
        if (selectedImage) {
            console.log("Using manually selected image");
            return selectedImage;
        } else if (useLiveDetection && currentImage) {
            console.log("Using live detection image");
            console.log("Current image type:", typeof currentImage);
            
            // Check if currentImage is a full data URL or just the base64 part
            if (typeof currentImage === 'string') {
                if (currentImage.startsWith && currentImage.startsWith('data:image')) {
                    // Extract base64 part from data URL
                    return currentImage.split(',')[1];
                }
                return currentImage;
            } else {
                console.error("Current image is not a string:", currentImage);
                return null;
            }
        }
        console.log("No image available to send");
        return null;
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1]; // Get base64 part
                setSelectedImage(base64String);
                setShowImagePreview(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSelectedImage = () => {
        setSelectedImage(null);
        setShowImagePreview(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const toggleLiveDetection = () => {
        setUseLiveDetection(prev => !prev);
        // Clear manually selected image when enabling live detection
        if (!useLiveDetection) {
            setSelectedImage(null);
            setShowImagePreview(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const imageToSend = getImageForRequest();
        
        console.log("Image to send:", imageToSend ? "Image data available" : "No image data");
        console.log("Live detection:", useLiveDetection);
        console.log("Current image available:", currentImage ? "Yes" : "No");
        
        // Check if there's an input message or an image to process
        if (!inputMessage.trim() && !imageToSend) return;

        // Create default message text based on context
        const messageText = inputMessage.trim() || (imageToSend ? "Analyze this image" : "");
        
        // Prepare user message for display
        const userMessage = { 
            text: messageText, 
            sender: 'user',
            // image: imageToSend,
            emotion: currentEmotion,
            confidence: currentConfidence
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: messageText,
                    image: imageToSend,
                    emotion: imageToSend ? currentEmotion : null,
                    confidence: imageToSend ? currentConfidence : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            const botMessage = { text: data.response, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
            
        } catch (error) {
            console.error('Error details:', error);
            let errorMessage = 'Sorry, I encountered an error. ';
            
            if (error.message.includes('API Error')) {
                errorMessage += 'There was an issue with the AI service. ';
            } else if (error.message.includes('Failed to process image')) {
                errorMessage += 'There was an issue processing the image. ';
            } else if (error.message.includes('No message or image')) {
                errorMessage += 'Please provide a message or image. ';
            } else {
                errorMessage += 'An unexpected error occurred. ';
            }
            errorMessage += 'Please try again.';
            
            const errorBotMessage = { text: errorMessage, sender: 'bot' };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
            // Clear both selected image and preview
            setSelectedImage(null);
            setShowImagePreview(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // Don't clear currentImage as it comes from props
        }
    };

    const handleNewChat = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_chat: true }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to start new chat');
            }
            
            const data = await response.json();
            setMessages([]);
            setShowPredefinedQueries(true); // Add this line to show queries again
        } catch (error) {
            console.error('Error starting new chat:', error);
            const errorMessage = { 
                text: 'Failed to start a new chat. Please try again.', 
                sender: 'bot' 
            };
            setMessages([errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const predefinedQueries = [
        "I'm feeling stressed, can you help?",
        "What are some relaxation techniques?",
        "How can I improve my mood?",
        "I need some positive affirmations",
        "Suggest some mindfulness exercises"
    ];

    const handlePredefinedQuery = (query) => {
        setInputMessage(query);
        setShowPredefinedQueries(false);
    };

    return (
        <div className="chatbot-container flex flex-col h-full">
          {/* Header */}
          <div className="chatbot-header p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Emotional Support Chat</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleLiveDetection}
                className={`live-detection-btn px-3 py-1.5 ${useLiveDetection ? 'bg-green-600/30 text-green-200' : 'bg-gray-600/20 text-gray-300'} rounded-lg border border-white/10 flex items-center gap-2 transition-all text-sm`}
              >
                {useLiveDetection ? 'Live Detection: ON' : 'Live Detection: OFF'}
              </button>
              <button 
                onClick={handleNewChat}
                className="new-chat-btn px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 rounded-lg border border-indigo-400/20 flex items-center gap-2 transition-all"
                disabled={isLoading}
              >
                <FaPlus className="text-sm" />
                <span className="text-sm">New Chat</span>
              </button>
            </div>
          </div>
      
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Predefined Queries Section - moved inside messages container */}
            {showPredefinedQueries && messages.length === 0 && !isLoading && (
                <div className="predefined-queries-container flex flex-col items-center justify-center h-full">
                    <div className="flex items-center gap-2 mb-4 text-sm text-white/70">
                        <FaLightbulb className="text-yellow-300" />
                        <span>Quick suggestions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {predefinedQueries.map((query, index) => (
                            <button
                                key={index}
                                onClick={() => handlePredefinedQuery(query)}
                                className="px-3 py-1 text-sm bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 rounded-lg border border-indigo-400/20 transition-all"
                            >
                                {query}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} p-3 rounded-lg max-w-[80%] ${
                  message.sender === 'user' ? 'ml-auto bg-indigo-600/20' : 'bg-white/5'
                }`}
              >
                {message.image && (
                  <div className="message-image mb-2">
                    <img 
                      src={`data:image/jpeg;base64,${message.image}`} 
                      alt="User uploaded" 
                      className="max-w-full rounded-lg"
                    />
                    {message.emotion && (
                      <div className="mt-1 text-xs text-indigo-300">
                        Detected: {message.emotion} ({message.confidence}%)
                      </div>
                    )}
                  </div>
                )}
                <div className="message-content text-white/90">{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message p-3 rounded-lg max-w-[80%] bg-white/5">
                <div className="message-content loading flex gap-1">
                  <span className="dot w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                  <span className="dot w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></span>
                  <span className="dot w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
      
          {/* Fixed Input Area */}
          <form onSubmit={handleSendMessage} className="fixed bottom-0 w-full chatbot-input border-t border-white/10 p-4">
            {/* Only show image preview if manually selected OR if live detection is enabled AND user wants to see preview */}
            {(showImagePreview && !useLiveDetection) && (
              <div className="image-preview mb-3 relative inline-block">
                {selectedImage ? (
                  <img 
                    src={`data:image/jpeg;base64,${selectedImage}`} 
                    alt="Preview" 
                    className="max-h-20 rounded-lg border border-white/10"
                  />
                ) : null}
                
                {selectedImage && (
                  <button 
                    type="button" 
                    onClick={removeSelectedImage}
                    className="remove-image absolute -top-2 -right-2 bg-red-500/80 rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-500"
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <div className="input-container flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={useLiveDetection ? "Type or send with live detection..." : "Type your message..."}
                disabled={isLoading}
                className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="image-upload-btn p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                disabled={isLoading || useLiveDetection}
                title={useLiveDetection ? "Disable live detection to upload images" : "Upload image"}
              >
                <FaImage className="w-5 h-5" />
              </button>
              <button 
                type="submit" 
                className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-indigo-200 transition-colors disabled:opacity-50"
                disabled={isLoading || (!inputMessage.trim() && !selectedImage && !(useLiveDetection && currentImage))}
              >
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
    );
};

export default Chatbot;