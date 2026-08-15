import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p className="stat-title">{title}</p>
          <h2 className="stat-value">{value}</h2>
        </div>

        <div className="stat-icon">
          <Icon size={22} />
        </div>
      </div>

      <p className="stat-description">{description}</p>
    </div>
  );
}

export default StatCard;
