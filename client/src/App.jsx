import LobbyScreen from "./screens/Lobby";
import "./App.css";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
      </Routes>
    </div>
  );
}

export default App;
