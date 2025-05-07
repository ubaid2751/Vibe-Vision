import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx"; // Ensure Dashboard.jsx exists
import Account from "./pages/Account.jsx"; // Ensure Account.jsx exists with correct case"
import ImageDetection from "./pages/ImageDetection.jsx"; // Ensure ImageDetection.jsx exists
import LiveDetection from "./pages/LiveDetection.jsx"; // Ensure LiveDetection.jsx exists
import UnderDevelopment from "./pages/UnderCons.jsx";
import AboutUs from "./pages/Aboutus.jsx";
import History from "./pages/History.jsx"; // Ensure History.jsx exists
const App = () => {
  return ( 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/detect-image" element={<ImageDetection />} />
        <Route path="/detect-live" element={<LiveDetection />} />
        <Route path="*" element={<Home />} />
        <Route path="/coming-soon" element={<UnderDevelopment />} />
        <Route path="/about" element = {<AboutUs/>}/>
        <Route path="/history" element= { <History/>}/>
      </Routes>
  );
};

export default App;
