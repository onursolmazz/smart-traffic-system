import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TrafficMap from "./pages/TrafficMap";
import Cameras from "./pages/Cameras";
import Dashboard from "./pages/Dashboard";
import TrafficEvents from "./pages/TrafficEvents";
import Vehicles from "./pages/Vehicles";
import Violations from "./pages/Violations";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/violations" element={<Violations />} />
            <Route path="/traffic-events" element={<TrafficEvents />} />
            <Route path="/map" element={<TrafficMap />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
