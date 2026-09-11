import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
