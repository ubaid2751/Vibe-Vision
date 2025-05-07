import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiArrowLeft, FiUser, FiMail, FiEdit2, FiSave, FiX } from "react-icons/fi";

const Account = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedData, setUpdatedData] = useState({ name: "", email: "" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:3000/user/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data) {
                    setUser(res.data);
                    setUpdatedData({ name: res.data.name, email: res.data.email });
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:3000/user/update-profile", updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(prev => ({ ...prev, ...updatedData }));
            setEditMode(false);
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] to-[#1a1a2f] flex items-center justify-center p-5 relative overflow-hidden">
            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-indigo-400/20 rounded-full"
                        initial={{
                            scale: 0,
                            x: Math.random() * 100 - 50,
                            y: Math.random() * 100 - 50
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            x: [0, Math.random() * 200 - 100, 0],
                            y: [0, Math.random() * 200 - 100, 0]
                        }}
                        transition={{
                            duration: 5 + Math.random() * 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Back to Dashboard Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-6 left-6 flex items-center space-x-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 px-4 py-2 rounded-lg border border-indigo-400/20 z-10"
                onClick={() => (window.location.href = "/dashboard")}
            >
                <FiArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
            </motion.button>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-md p-8"
            >
                <div className="mb-10 text-center">
                    <motion.h2 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent"
                    >
                        Account Settings
                    </motion.h2>
                    <p className="mt-2 text-gray-400">Manage your profile information</p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                        />
                        <p className="text-white/70">Loading user details...</p>
                    </div>
                ) : user ? (
                    <div className="space-y-6">
                        {editMode ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-indigo-300/80 font-medium flex items-center gap-2">
                                            <FiUser className="text-indigo-400" />
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={updatedData.name}
                                            onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all pl-12"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-indigo-300/80 font-medium flex items-center gap-2">
                                            <FiMail className="text-indigo-400" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={updatedData.email}
                                            onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all pl-12"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleUpdate} 
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                                    >
                                        <FiSave />
                                        Save Changes
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setEditMode(false)} 
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-transparent border border-white/20 text-white/80 rounded-xl font-medium hover:border-white/40 hover:text-white transition-all"
                                    >
                                        <FiX />
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                                        <div className="flex items-center gap-2 text-indigo-300/80">
                                            <FiUser />
                                            <span className="font-medium">Name:</span>
                                        </div>
                                        <span className="text-white/90">{user.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <div className="flex items-center gap-2 text-indigo-300/80">
                                            <FiMail />
                                            <span className="font-medium">Email:</span>
                                        </div>
                                        <span className="text-white/90">{user.email}</span>
                                    </div>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setEditMode(true)} 
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl font-medium hover:border-indigo-500/50 hover:text-white transition-all"
                                >
                                    <FiEdit2 />
                                    Edit Profile
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-red-400">
                        Failed to load user data. Please try again.
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Account;