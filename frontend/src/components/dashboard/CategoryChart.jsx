import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CategoryChart({ data }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip formatter={(value) => value.toLocaleString()} />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Nombre de demandes" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CategoryChart;