import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [races, setRaces] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myPredictions, setMyPredictions] = useState([]);

  const refreshCore = async () => {
    const [racesRes, boardRes, predsRes] = await Promise.all([
      api.get('/races'),
      api.get('/predictions/leaderboard/all'),
      api.get('/predictions/me'),
    ]);
    setRaces(racesRes.data);
    setLeaderboard(boardRes.data);
    setMyPredictions(predsRes.data);
  };

  useEffect(() => {
    if (localStorage.getItem('f1_token')) refreshCore().catch(() => null);
  }, []);

  const currentRace = useMemo(() => races.find((race) => !race.isLockedDynamic) || races[0], [races]);

  return (
    <AppContext.Provider value={{ races, leaderboard, myPredictions, currentRace, refreshCore, setMyPredictions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
