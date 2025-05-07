import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "white", display: "flex", justifyContent: "space-between" }}>
      <h2>EmotionSense</h2>
      <div>
        <Link to="/" style={{ color: "white", marginRight: "15px" }}>Home</Link>
        <Link to="/login" style={{ color: "white", marginRight: "15px" }}>Login</Link>
        <Link to="/signup" style={{ color: "white", marginRight: "15px" }}>Signup</Link>
        <Link to="/logout" style={{ color: "red", fontWeight: "bold" }}>Logout</Link>
      </div>
    </nav>
  );
};
export default Navbar;