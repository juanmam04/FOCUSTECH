import './BarChart.css';

export default function BarChart({ data = [], valueKey = 'value', labelKey = 'label', formatValue }) {
  if (!data.length) {
    return <p className="metrics-empty">Sin datos en este período</p>;
  }

  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const fmt = formatValue || ((v) => v);

  return (
    <div className="bar-chart">
      {data.map((row, i) => {
        const val = Number(row[valueKey]) || 0;
        const pct = Math.round((val / max) * 100);
        const label = row[labelKey] ?? row.day ?? row.path ?? '—';
        return (
          <div key={i} className="bar-chart__row">
            <span className="bar-chart__label" title={String(label)}>
              {formatDayLabel(label)}
            </span>
            <div className="bar-chart__track">
              <div className="bar-chart__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="bar-chart__value">{fmt(val)}</span>
          </div>
        );
      })}
    </div>
  );
}

function formatDayLabel(label) {
  if (!label) return '—';
  const s = String(label);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
    }
  }
  if (s.length > 28) return `${s.slice(0, 26)}…`;
  return s;
}
