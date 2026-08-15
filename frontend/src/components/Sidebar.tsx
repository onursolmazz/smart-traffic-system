import {
  Bell,
  Camera,
  Car,
  Gauge,
  LayoutDashboard,
  Map,
  TrafficCone,
  TriangleAlert,
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
          <NavLink to="/" className="" style={{textDecoration : "none" }}>
            <h2>Akıllı Trafik</h2>
            <span>Yönetim Sistemi</span>
          </NavLink>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={19} />
          Gösterge Paneli
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Map size={19} />
          Trafik Haritası
        </NavLink>

        <NavLink
          to="/vehicles"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Car size={19} />
          Araçlar
        </NavLink>

        <NavLink
          to="/cameras"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Camera size={19} />
          Kameralar
        </NavLink>

        <NavLink
          to="/violations"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <TriangleAlert size={19} />
          İhlaller
        </NavLink>

        <NavLink
          to="/traffic-events"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Gauge size={19} />
          Trafik Olayları
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Bell size={19} />
          Bildirimler
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>Sistem Durumu</span>

        <div className="system-status">
          <span className="status-dot" />
          Tüm sistemler çalışıyor
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
