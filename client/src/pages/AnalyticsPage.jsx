import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/client';
import { useApp } from '../context/AppContext';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const { leaderboard } = useApp();

  useEffect(() => {
    api.get('/admin/analytics').then((res) => setAnalytics(res.data)).catch(() => null);
  }, []);

  const chartData = leaderboard.map((row) => ({ name: row.name, points: row.totalPoints }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-4">Most accurate predictor: <b>{analytics?.mostAccurate?.name || '-'}</b></div>
        <div className="glass-card p-4">Most podium hits: <b>{analytics?.mostPodiums?.name || '-'}</b></div>
        <div className="glass-card p-4">Biggest point jump: <b>{analytics?.biggestJump?.name || '-'} ({analytics?.biggestJump?.jump || 0})</b></div>
        <div className="glass-card p-4">Worst prediction: <b>{analytics?.worstPrediction?.userId?.name || '-'}</b></div>
      </div>
      <div className="glass-card p-4 h-80">
        <h2 className="font-semibold mb-2">Points progression snapshot</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="points" stroke="#E10600" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;
