import { motion } from "framer-motion";
import { FiMail, FiLinkedin, FiInstagram, FiCoffee } from "react-icons/fi";

// First, import your team member images at the top of the file
import utkarshImg from "../assets/team/utkarsh.jpeg";
import ubaidImg from "../assets/team/ubaid.jpg";
import smritiImg from "../assets/team/smriti.jpeg";
import saiImg from "../assets/team/arvind.jpeg";

const AboutUs = () => {
    // Update the teamMembers array to include image paths
    const teamMembers = [
        {
            name: "Utkarsh",
            role: "Full Stack Developer",
            gmail: "mailto:utkarsh@example.com",
            linkedin: "https://linkedin.com/in/utkarsh",
            instagram: "https://instagram.com/utkarsh",
            image: utkarshImg
          },
          {
            name: "Ubaid Abbas",
            role: "AI/ML Engineer",
            gmail: "mailto:ubaid@example.com",
            linkedin: "https://linkedin.com/in/ubaid",
            instagram: "https://instagram.com/ubaid",
            image: ubaidImg
        },
        {
          name: "Smriti Tiwari",
          role: "Full Stack Developer",
          gmail: "mailto:smriti@example.com",
          linkedin: "https://linkedin.com/in/smriti",
          instagram: "https://instagram.com/smriti",
          image: smritiImg
        },
        {
          name: "Sai Arvind Karthik",
          role: "AI/ML Engineer",
          gmail: "mailto:sai@example.com",
          linkedin: "https://linkedin.com/in/sai",
          instagram: "https://instagram.com/sai",
          image: saiImg
        }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1f] to-[#1a1a2f] relative overflow-hidden p-8">
      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/20 rounded-full"
            initial={{ 
                scale: 0, 
                x: Math.random() * 100 - 50, 
                y: Math.random() * 100 - 50,
                opacity: 0
            }}
            animate={{ 
                scale: [0, 1, 0], 
                x: [0, Math.random() * 200 - 100, 0], 
                y: [0, Math.random() * 200 - 100, 0],
                opacity: [0, 0.8, 0]
            }}
            transition={{ 
                duration: 8 + Math.random() * 5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * 2
            }}
        />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent mb-4"
          >
            About EmotionIQ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Pioneering Emotion Intelligence through Advanced AI Solutions
          </motion.p>
        </motion.div>

        {/* Platform Introduction with Animation */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-indigo-300 mb-6">Our Platform</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            EmotionIQ is an innovative AI-powered platform specializing in real-time emotion recognition. 
            Our cutting-edge technology leverages deep learning models to analyze facial expressions with 
            unprecedented accuracy, revolutionizing human-computer interaction.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-gray-400">
            <div>
              <h3 className="text-xl font-semibold text-indigo-300 mb-4">Legal Information</h3>
              <p className="mb-4 text-sm">
                © {new Date().getFullYear()} EmotionIQ. All rights reserved.<br />
                Patent Pending: US2023EMOTIONIQ001
              </p>
              <p className="text-sm">
                By using our services, you agree to our <a href="/coming-soon" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and 
                <a href="/coming-soon" className="text-indigo-400 hover:text-indigo-300"> Privacy Policy</a>.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-indigo-300 mb-4">Compliance</h3>
              <ul className="list-disc list-inside text-sm space-y-2">
                <li>GDPR Compliant Data Handling</li>
                <li>ISO 27001 Certified Security</li>
                <li>Regular Third-Party Audits</li>
                <li>Ethical AI Framework Adherent</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Team Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-indigo-300 text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Our Team
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              // Then modify the team card component to display the image
              <motion.div 
                key={index}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ 
                    y: -10,
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)"
                }}
              >
                <motion.div 
                    className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                >
                    <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                    />
                </motion.div>
                <h3 className="text-xl font-semibold text-indigo-300 mb-2">{member.name}</h3>
                <p className="text-gray-400 mb-4">{member.role}</p>
                <motion.div 
                    className="flex justify-center space-x-4"
                    whileHover={{ scale: 1.1 }}
                >
                    <a href={member.gmail} className="text-gray-400 hover:text-indigo-400">
                      <FiMail size={20} />
                    </a>
                    <a href={member.linkedin} className="text-gray-400 hover:text-indigo-400">
                      <FiLinkedin size={20} />
                    </a>
                    <a href={member.instagram} className="text-gray-400 hover:text-indigo-400">
                      <FiInstagram size={20} />
                    </a>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer with Animation */}
        <motion.footer 
          className="text-center border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium mb-6 flex items-center justify-center mx-auto"
          >
            <FiCoffee className="mr-2" />
            Buy Us a Coffee
          </motion.button>
          
          <div className="flex justify-center space-x-6 mb-4">
            <a href="/terms" className="text-gray-400 hover:text-indigo-400 text-sm">Terms of Service</a>
            <a href="/privacy" className="text-gray-400 hover:text-indigo-400 text-sm">Privacy Policy</a>
            <a href="/contact" className="text-gray-400 hover:text-indigo-400 text-sm">Contact Us</a>
          </div>
          
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EmotionIQ Technologies. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default AboutUs;