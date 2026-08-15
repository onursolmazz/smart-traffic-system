import { Bell } from "lucide-react";

import { useLocation } from "react-router-dom";

interface PageInfo {
  title: string;
  description: string;
}

const pageInfo: Record<string, PageInfo> = {
  "/dashboard": {
    title: "Gösterge Paneli",
    description: "Trafik sisteminin genel durumunu görüntüleyin.",
  },

  "/vehicles": {
    title: "Araçlar",
    description: "Sistemde kayıtlı araçları yönetin.",
  },

  "/cameras": {
    title: "Kameralar",
    description: "Trafik kameralarını görüntüleyin ve yönetin.",
  },

  "/violations": {
    title: "İhlaller",
    description: "Trafik ihlallerini görüntüleyin ve yönetin.",
  },

  "/traffic-events": {
    title: "Trafik Olayları",
    description: "Trafik olaylarını görüntüleyin ve yönetin.",
  },
};

function Header() {
  const location = useLocation();

  const currentPage = pageInfo[location.pathname] ?? {
    title: "Akıllı Trafik",
    description: "Akıllı Trafik Yönetim Sistemi",
  };

  return (
    <header className="app-header">
      <div className="header-page-info">
        <h2>{currentPage.title}</h2>

        <p>{currentPage.description}</p>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="Bildirimler"
        >
          <Bell size={20} />

          <span className="notification-dot" />
        </button>

        <div className="header-profile">
          <div className="profile-avatar">Y</div>

          <div className="profile-info">
            <strong>Yönetici</strong>

            <span>Sistem Yöneticisi</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
