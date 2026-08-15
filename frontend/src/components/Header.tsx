import { Bell } from "lucide-react";

function Header() {
  return (
    <header className="header">
      <div>
        <h1>Traffic Overview</h1>
        <p>Monitor traffic activity and system status.</p>
      </div>

      <div className="header-actions">
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">OS</div>

          <div className="profile-info">
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
