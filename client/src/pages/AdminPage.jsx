import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useApp } from '../context/AppContext';

const AdminPage = () => {
  const { races, refreshCore } = useApp();
  const [selectedRace, setSelectedRace] = useState('');
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState({ p1: '', p2: '', p3: '', pole: '' });

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data));
  }, []);

  const enterResults = async () => {
    await api.put(`/admin/races/${selectedRace}/results`, results);
    toast.success('Results saved');
  };

  const scoreRace = async () => {
    await api.post(`/admin/races/${selectedRace}/score`);
    toast.success('Scoring complete');
    refreshCore();
  };

  const toggleLock = async () => {
    await api.patch(`/races/${selectedRace}/lock`);
    toast.success('Lock toggled');
    refreshCore();
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 space-y-3">
        <h1 className="text-2xl text-trackRed racing-title">Admin Control Room</h1>
        <select className="w-full p-2 rounded bg-black/40" value={selectedRace} onChange={(e) => setSelectedRace(e.target.value)}>
          <option value="">Select race</option>
          {races.map((race) => <option key={race._id} value={race._id}>{race.raceName}</option>)}
        </select>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['p1', 'p2', 'p3', 'pole'].map((key) => (
            <input key={key} className="p-2 rounded bg-black/40" placeholder={key.toUpperCase()} onChange={(e) => setResults({ ...results, [key]: e.target.value })} />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="bg-trackRed px-3 py-2 rounded" onClick={enterResults}>Enter official results</button>
          <button className="bg-green-700 px-3 py-2 rounded" onClick={scoreRace}>Run scoring</button>
          <button className="bg-yellow-700 px-3 py-2 rounded" onClick={toggleLock}>Lock/Unlock weekend</button>
        </div>
      </div>
      <div className="glass-card p-4">
        <h2 className="font-semibold mb-2">Manage Users</h2>
        {users.map((u) => <div key={u._id} className="py-2 border-b border-white/10">{u.name} - {u.email} - {u.role}</div>)}
      </div>
    </div>
  );
};

export default AdminPage;
