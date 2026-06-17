/*
'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import LeaderboardPodium from '@/components/LeaderboardPodium';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { calculateTotalPoints } from '@/lib/scoring';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: users } = await supabase.from('users').select('id, name');

      const scored = await Promise.all(
        (users ?? []).map(async (u) => ({
          id: u.id,
          name: u.name,
          points: await calculateTotalPoints(supabase, u.id),
        })),
      );

      scored.sort((a, b) => b.points - a.points);
      setRows(scored);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <AuthGuard>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-2 text-gray-500">Celkový žebříček všech hráčů</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Calculating scores…</p>
      ) : rows.length === 0 ? (
        <p className="card p-10 text-center text-gray-500">No players yet.</p>
      ) : (
        <>
          {rows.length > 0 && (
            <LeaderboardPodium rows={rows} currentUserId={user?.id} />
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
                  <th className="px-6 py-4 font-medium text-gray-600">#</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Player</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 last:border-0 ${
                      row.id === user?.id ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.name}
                      {row.id === user?.id && (
                        <span className="ml-2 text-xs font-normal text-teal-600">(you)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-transparent bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AuthGuard>
  );
}
*/


'use client';
 
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import LeaderboardPodium from '@/components/LeaderboardPodium';
import PlayerPointsModal from '@/components/PlayerPointsModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { calculateTotalPoints } from '@/lib/scoring';
 
export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
 
  useEffect(() => {
    async function load() {
      const { data: users } = await supabase.from('users').select('id, name');
 
      const scored = await Promise.all(
        (users ?? []).map(async (u) => ({
          id: u.id,
          name: u.name,
          points: await calculateTotalPoints(supabase, u.id),
        })),
      );
 
      scored.sort((a, b) => b.points - a.points);
      setRows(scored);
      setLoading(false);
    }
 
    load();
  }, []);
 
  return (
    <AuthGuard>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-2 text-gray-500">Celkový žebříček všech hráčů</p>
      </div>
 
      {loading ? (
        <p className="text-gray-500">Calculating scores…</p>
      ) : rows.length === 0 ? (
        <p className="card p-10 text-center text-gray-500">No players yet.</p>
      ) : (
        <>
          {rows.length > 0 && (
            <LeaderboardPodium rows={rows} currentUserId={user?.id} />
          )}
 
          <div className="card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-teal-50/50 to-blue-50/50">
                  <th className="px-6 py-4 font-medium text-gray-600">#</th>
                  <th className="px-6 py-4 font-medium text-gray-600">Player</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-600">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPlayer(row)}
                    className={`cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                      row.id === user?.id ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {row.name}
                      {row.id === user?.id && (
                        <span className="ml-2 text-xs font-normal text-teal-600">(you)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-transparent bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
 
      {selectedPlayer && (
        <PlayerPointsModal
          userId={selectedPlayer.id}
          userName={selectedPlayer.name}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </AuthGuard>
  );
}
 