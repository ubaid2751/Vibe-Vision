import { motion } from "framer-motion";
import styles from "../styles/Logo.module.css";

const Logo = ({ size = "medium" }) => {
  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  };

  return (
    <motion.div 
      className={`${styles.logoContainer} ${sizeClasses[size]}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <motion.span
        className={styles.vibe}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Vibe
      </motion.span>
      <motion.span
        className={styles.vision}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
      >
        Vision
      </motion.span>
    </motion.div>
  );
};

export default Logo;