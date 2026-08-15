import {
  Camera,
  Car,
  Gauge,
  LayoutDashboard,
  TriangleAlert,
  TrafficCone,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <TrafficCone size={24} />
        </div>

        <div>
          <h2>Smart Traffic</h2>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Car size={19} />
          Vehicles
        </NavLink>

        <NavLink
          to="/cameras"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Camera size={19} />
          Cameras
        </NavLink>

        <NavLink
          to="/violations"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <TriangleAlert size={19} />
          Violations
        </NavLink>

        <NavLink
          to="/traffic-events"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Gauge size={19} />
          Traffic Events
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>System Status</span>

        <div className="system-status">
          <span className="status-dot" />
          All systems operational
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
