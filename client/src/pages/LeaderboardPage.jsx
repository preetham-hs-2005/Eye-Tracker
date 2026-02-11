import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

const LeaderboardPage = () => {
  const { leaderboard } = useApp();

  return (
    <div className="glass-card p-6">
      <h1 className="text-2xl font-bold racing-title text-trackRed mb-4">Leaderboard</h1>
      <div className="space-y-2">
        {leaderboard.map((entry) => (
          <motion.div layout key={entry._id} className="flex justify-between bg-black/40 rounded p-3">
            <div>
              <p className="font-semibold">{medal[entry.rank] || `#${entry.rank}`} {entry.name}</p>
              <p className="text-xs text-white/70">Winners: {entry.stats.correctWinners} · Podiums: {entry.stats.exactPodiums}</p>
            </div>
            <p className="font-bold text-trackRed">{entry.totalPoints} pts</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
