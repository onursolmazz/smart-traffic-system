import type { RecentViolation } from "../types/dashboard";

interface RecentViolationsTableProps {
  violations: RecentViolation[];
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    detected: "Tespit Edildi",
    reviewed: "İncelendi",
    approved: "Onaylandı",
  };

  return labels[status] ?? status;
}

function RecentViolationsTable({ violations }: RecentViolationsTableProps) {
  if (violations.length === 0) {
    return <div className="empty-state">Henüz ihlal bulunmuyor.</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="violations-table">
        <thead>
          <tr>
            <th>Plaka</th>
            <th>İhlal</th>
            <th>Kamera</th>
            <th>Hız</th>
            <th>Durum</th>
            <th>Tarih</th>
          </tr>
        </thead>

        <tbody>
          {violations.map((violation) => {
            const type = violation.violation_type ?? violation.violationType;

            return (
              <tr key={violation.id}>
                <td>
                  <strong>{violation.vehicle?.plate ?? "-"}</strong>
                </td>

                <td>{type?.name ?? "-"}</td>

                <td>{violation.camera?.code ?? "-"}</td>

                <td>{violation.speed ? `${violation.speed} km/h` : "-"}</td>

                <td>
                  <span className={`status-badge ${violation.status}`}>
                    {getStatusLabel(violation.status)}
                  </span>
                </td>

                <td>
                  {new Date(violation.detected_at).toLocaleString("tr-TR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default RecentViolationsTable;
