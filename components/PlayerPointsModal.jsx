/*
'use client';  
 
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateMatchPoints, formatStage } from '@/lib/scoring';
 
export default function PlayerPointsModal({ userId, userName, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!userId) return;
 
    let active = true; 
 
    async function load() {
      setLoading(true);
 
      const [predictionsRes, matchesRes] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', userId),
        supabase.from('matches').select('*'),
      ]);
 
      if (!active) return;
 
      const matchesById = Object.fromEntries(
        (matchesRes.data ?? []).map((m) => [m.id, m]),
      );
 
      const withPoints = (predictionsRes.data ?? [])
        .map((prediction) => {
          const match = matchesById[prediction.match_id];
          if (!match) return null;
 
          return {
            matchId: match.id,
            label: `${match.team_home} vs ${match.team_away}`,
            stage: formatStage(match.stage),
            startTime: match.start_time,
            points: calculateMatchPoints(prediction, match),
          };
        })
        .filter(Boolean)
        // Nejnovější / nejvíc bodů nahoře ať je přehled na první pohled užitečný
        .sort((a, b) => b.points - a.points);
 
      setRows(withPoints);
      setLoading(false);
    }
 
    load();
 
    return () => {
      active = false;
    };
  }, [userId]);
 
  if (!userId) return null;
 
  const totalShown = rows.reduce((sum, r) => sum + r.points, 0);
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[80vh] w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
            <p className="text-sm text-gray-500">Body podle zápasů</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Zavřít"
          >
            ✕
          </button>
        </div>
 
        <div className="max-h-[55vh] overflow-y-auto">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Načítám…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Žádné tipy zatím nemají body.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {rows.map((row) => (
                <li
                  key={row.matchId}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.label}</p>
                    <p className="text-xs text-gray-500">{row.stage}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      row.points > 0 ? 'text-teal-600' : 'text-gray-400'
                    }`}
                  >
                    +{row.points} b.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
 
        {!loading && rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <span className="text-sm text-gray-500">Celkem ze zápasů</span>
            <span className="text-sm font-bold text-gray-900">{totalShown} b.</span>
          </div>
        )}
      </div>
    </div>
  );
}

*/





'use client';
 
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateMatchPoints, formatStage } from '@/lib/scoring';
 
export default function PlayerPointsModal({ userId, userName, onClose }) {
  const [rows, setRows] = useState([]);
  const [scorerPoints, setScorerPoints] = useState(0);
  const [scorerName, setScorerName] = useState(null);
  const [winnerPoints, setWinnerPoints] = useState(0);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!userId) return;
 
    let active = true;
 
    async function load() {
      setLoading(true);
 
      const [predictionsRes, matchesRes, bonusRes, playerGoalsRes] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', userId),
        supabase.from('matches').select('*'),
        supabase.from('bonus_predictions').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('players_goals').select('*'),
      ]);
 
      if (!active) return;
 
      const matches = matchesRes.data ?? [];
      const matchesById = Object.fromEntries(matches.map((m) => [m.id, m]));
 
      const withPoints = (predictionsRes.data ?? [])
        .map((prediction) => {
          const match = matchesById[prediction.match_id];
          if (!match) return null;
 
          return {
            matchId: match.id,
            label: `${match.team_home} vs ${match.team_away}`,
            stage: formatStage(match.stage),
            startTime: match.start_time,
            points: calculateMatchPoints(prediction, match),
          };
        })
        .filter(Boolean)
        // Nejnovější / nejvíc bodů nahoře ať je přehled na první pohled užitečný
        .sort((a, b) => b.points - a.points);
 
      setRows(withPoints);
 
      // Body za tip na střelce: kolik gólů zatím dal hráč, kterého si uživatel tipnul.
      const bonus = bonusRes.data;
      const playerGoals = playerGoalsRes.data ?? [];
 
      if (bonus?.predicted_player) {
        const record = playerGoals.find((p) => p.player_name === bonus.predicted_player);
        setScorerPoints(record?.goals_scored ?? 0);
        setScorerName(bonus.predicted_player);
      } else {
        setScorerPoints(0);
        setScorerName(null);
      }
 
      // Body za tip na vítěze turnaje: připíšou se až po odehrání finále.
      const finalMatch = matches.find((m) => m.stage === 'final' && m.is_finished);
      if (finalMatch && bonus?.predicted_winner_team) {
        const winner =
          finalMatch.home_score > finalMatch.away_score
            ? finalMatch.team_home
            : finalMatch.away_score > finalMatch.home_score
              ? finalMatch.team_away
              : null;
 
        setWinnerPoints(winner && bonus.predicted_winner_team === winner ? 10 : 0);
      } else {
        setWinnerPoints(0);
      }
 
      setLoading(false);
    }
 
    load();
 
    return () => {
      active = false;
    };
  }, [userId]);
 
  if (!userId) return null;
 
  const totalShown = rows.reduce((sum, r) => sum + r.points, 0);
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[80vh] w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
            <p className="text-sm text-gray-500">Body podle zápasů</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Zavřít"
          >
            ✕
          </button>
        </div>
 
        <div className="max-h-[55vh] overflow-y-auto">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Načítám…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">Žádné tipy zatím nemají body.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {rows.map((row) => (
                <li
                  key={row.matchId}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.label}</p>
                    <p className="text-xs text-gray-500">{row.stage}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      row.points > 0 ? 'text-teal-600' : 'text-gray-400'
                    }`}
                  >
                    +{row.points} b.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
 
        {!loading && rows.length > 0 && (
          <div className="space-y-2 border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Celkem ze zápasů</span>
              <span className="text-sm font-bold text-gray-900">{totalShown} b.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Celkem za střelce{scorerName ? `: ${scorerName}` : ''}
              </span>
              <span className="text-sm font-bold text-gray-900">{scorerPoints} b.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Celkem za vítěze{winnerTeamName ? `: ${winnerTeamName}` : ''}
              </span>
              <span className="text-sm font-bold text-gray-900">{winnerPoints} b.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}