import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BillingChart = ({ data, chartType = 'line' }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-600">No data available for charts.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chartType === 'line' ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} name="Revenue (₹)" />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#4f46e5" name="Number of Bills" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default BillingChart;