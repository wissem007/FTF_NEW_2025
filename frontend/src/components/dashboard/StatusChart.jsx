import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function StatusChart({ data }) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.replace(/Ã©/g, 'é').replace(/Ã´/g, 'ô'),
    value
  }));

  const COLORS = {
    'Initial': '#94a3b8',
    'En attente': '#f59e0b',
    'Validée': '#10b981',
    'Imprimée': '#8b5cf6',
    'Rejetée': '#ef4444'
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => value.toLocaleString()} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default StatusChart;