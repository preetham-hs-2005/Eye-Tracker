import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti';
import api from '../api/client';
import CountdownTimer from '../components/CountdownTimer';
import PodiumDnD from '../components/PodiumDnD';
import { useApp } from '../context/AppContext';

const drivers = [
  'Max Verstappen','Lando Norris','Charles Leclerc','Lewis Hamilton','George Russell','Oscar Piastri',
  'Carlos Sainz','Fernando Alonso','Sergio Perez','Pierre Gasly','Esteban Ocon','Yuki Tsunoda'
];

const DashboardPage = () => {
  const { currentRace, refreshCore } = useApp();
  const [podium, setPodium] = useState(drivers.slice(0, 3));
  const [pole, setPole] = useState(drivers[0]);
  const [unexpectedStatement, setUnexpectedStatement] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const canSubmit = useMemo(() => currentRace && !currentRace.isLockedDynamic, [currentRace]);

  const submit = async () => {
    try {
      await api.post('/predictions', {
        raceId: currentRace._id,
        predictedP1: podium[0],
        predictedP2: podium[1],
        predictedP3: podium[2],
        predictedPole: pole,
        unexpectedStatement,
      });
      toast.success('Prediction saved');
      setShowConfetti(podium[0] === pole);
      setTimeout(() => setShowConfetti(false), 2500);
      refreshCore();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    }
  };

  if (!currentRace) return <div className="animate-pulse h-52 glass-card" />;

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={220} />}
      <section className="glass-card p-6">
        <h2 className="text-xl font-bold text-trackRed">{currentRace.raceName}</h2>
        <p className="text-white/70">{currentRace.circuit}, {currentRace.country}</p>
        <p>Prediction lock in: <CountdownTimer lockTime={currentRace.lockTime} /></p>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3">Drag Your Podium (P1-P3)</h3>
          <PodiumDnD selected={podium} setSelected={setPodium} />
        </div>
        <div className="glass-card p-4 space-y-3">
          <h3 className="font-semibold">Pole Position</h3>
          <select className="w-full p-2 rounded bg-black/40" value={pole} onChange={(e) => setPole(e.target.value)}>
            {drivers.map((driver) => <option key={driver}>{driver}</option>)}
          </select>
          <h3 className="font-semibold">Expect the Unexpected</h3>
          <textarea className="w-full p-2 rounded bg-black/40 h-28" value={unexpectedStatement} onChange={(e) => setUnexpectedStatement(e.target.value)} placeholder="Underdog podium? Safety car chaos?" />
          <button disabled={!canSubmit || !unexpectedStatement} onClick={submit} className="w-full bg-trackRed py-2 rounded disabled:bg-gray-700">
            {canSubmit ? 'Submit Prediction' : 'Weekend Locked'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
