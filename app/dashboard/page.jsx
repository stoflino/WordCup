'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MatchCard from '@/components/MatchCard';
import { useAuth } from '@/context/AuthContext';
import { isMatchLocked } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingMatchId, setSavingMatchId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const loadData = useCallback(async () => {
    if (!user) return;

    const [matchesRes, predictionsRes] = await Promise.all([
      supabase.from('matches').select('*').order('start_time', { ascending: true }),
      supabase.from('predictions').select('*').eq('user_id', user.id),
    ]);

    setMatches(matchesRes.data ?? []);
    setPredictions(
      Object.fromEntries((predictionsRes.data ?? []).map((p) => [p.match_id, p])),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const savePrediction = async (matchId, predictedHome, predictedAway) => {
    const match = matches.find((m) => m.id === matchId);

    if (!match || isMatchLocked(match)) {
      showMessage('Tento zápas je uzamčen — tip nelze uložit.', 'error');
      return;
    }

    setSavingMatchId(matchId);

    const payload = {
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: predictedHome,
      predicted_away_score: predictedAway,
    };

    const existing = predictions[matchId];
    const { data, error } = existing
      ? await supabase
          .from('predictions')
          .update({
            predicted_home_score: predictedHome,
            predicted_away_score: predictedAway,
          })
          .eq('id', existing.id)
          .select()
          .single()
      : await supabase.from('predictions').insert(payload).select().single();

    setSavingMatchId(null);

    if (error) {
      showMessage(error.message, 'error');
      return;
    }

    setPredictions((prev) => ({ ...prev, [matchId]: data }));
    showMessage('Tip uložen!');
  };



  return (
    <AuthGuard>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <p className="mt-2 text-gray-500">Tipuj přesný výsledek zápasů</p>
      </div>

      {message && (
        <p className={`mb-6 ${messageType === 'error' ? 'msg-error' : 'msg-success'}`}>
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading matches…</p>
      ) : matches.length === 0 ? (
        <p className="card p-10 text-center text-gray-500">No matches yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              onSave={savePrediction}
              saving={savingMatchId === match.id}
            />
          ))}
        </div>
      )}
    </AuthGuard>
  );
}
