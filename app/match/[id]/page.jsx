'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { calculateMatchPoints, formatStage } from '@/lib/scoring';
import { isMatchLocked } from '@/lib/auth';

export default function MatchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const matchId = Number(id);
    const [matchRes, predictionsRes, usersRes] = await Promise.all([
      supabase.from('matches').select('*').eq('id', matchId).single(),
      supabase.from('predictions').select('*').eq('match_id', matchId),
      supabase.from('users').select('id, name'),
    ]);

    setMatch(matchRes.data);
    setPredictions(predictionsRes.data ?? []);
    setUsers(Object.fromEntries((usersRes.data ?? []).map((u) => [u.id, u.name])));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showAllPredictions = match?.is_finished;

  const visiblePredictions = showAllPredictions
    ? predictions
    : predictions.filter((p) => p.user_id === user?.id);

  const hiddenCount = showAllPredictions ? 0 : predictions.length - visiblePredictions.length;

  return (
    <AuthGuard>
      <Link href="/dashboard" className="link-accent mb-8 inline-flex text-sm">
        ← Back to matches
      </Link>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : !match ? (
        <p className="text-gray-500">Match not found.</p>
      ) : (
        <>
          <div className="card mb-10 p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-accent">{formatStage(match.stage)}</span>
              {match.is_finished ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  Finished
                </span>
              ) : isMatchLocked(match) ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                  Locked
                </span>
              ) : (
                <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-600">
                  Open for predictions
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-bold text-gray-900">
              {match.team_home} vs {match.team_away}
            </h1>
            <p className="mt-2 text-gray-500">
              {match.start_time
                ? new Date(match.start_time).toLocaleString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })
                : 'Čas zatím neznámý'}
            </p>

            {match.is_finished && (
              <p className="mt-5 text-2xl font-semibold text-gray-800">
                Final score: {match.home_score}:{match.away_score}
              </p>
            )}
          </div>

          <section className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50/30 to-blue-50/30 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Predictions</h2>
              {!showAllPredictions && (
                <p className="mt-1 text-sm text-gray-500">
                  Po skončení zápasu uvidíš tipy ostatních.
                  {hiddenCount > 0 && ` (${hiddenCount} už tipovali)`}
                </p>
              )}
            </div>

            {visiblePredictions.length === 0 ? (
              <p className="p-8 text-gray-500">No predictions yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {visiblePredictions.map((prediction) => {
                  const points = calculateMatchPoints(prediction, match);
                  const isOwn = prediction.user_id === user?.id;

                  return (
                    <li
                      key={prediction.id}
                      className={`flex items-center justify-between px-6 py-5 ${
                        isOwn ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {users[prediction.user_id] ?? 'Unknown'}
                          {isOwn && (
                            <span className="ml-2 text-xs font-normal text-teal-600">(you)</span>
                          )}
                        </p>
                        <p className="text-lg text-gray-700">
                          {prediction.predicted_home_score}:{prediction.predicted_away_score}
                        </p>
                      </div>
                      {match.is_finished && (
                        <span className="rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 px-3 py-1 text-sm font-semibold text-teal-700">
                          +{points} pts
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </AuthGuard>
  );
}
