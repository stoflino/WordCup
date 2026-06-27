/*

const STAGE_MULTIPLIERS = {
  playoff: 2,
  quarterfinal: 3,
  semifinal: 4,
  final: 5,
};

export function getStageMultiplier(stage) {
  return STAGE_MULTIPLIERS[stage] ?? 1;
}

export function getMatchOutcome(homeScore, awayScore) {
  if (homeScore > awayScore) return 'home';
  if (awayScore > homeScore) return 'away';
  return 'draw';
}

export function calculateMatchPoints(prediction, match) {
  if (!match?.is_finished || match.home_score == null || match.away_score == null) {
    return 0;
  }

  const { predicted_home_score: predHome, predicted_away_score: predAway } = prediction;
  const { home_score: actualHome, away_score: actualAway } = match;

  let basePoints = 0;

  if (predHome === actualHome && predAway === actualAway) {
    basePoints = 2;
  } else if (
    getMatchOutcome(predHome, predAway) === getMatchOutcome(actualHome, actualAway)
  ) {
    basePoints = 1;
  }

  return basePoints * getStageMultiplier(match.stage);
}

export function calculateBonusPoints(bonusPrediction, matches, playerGoals) {
  if (!bonusPrediction) return 0;

  let points = 0;

  const finalMatch = matches.find((m) => m.stage === 'final' && m.is_finished);
  if (finalMatch && bonusPrediction.predicted_winner_team) {
    const winner =
      finalMatch.home_score > finalMatch.away_score
        ? finalMatch.team_home
        : finalMatch.away_score > finalMatch.home_score
          ? finalMatch.team_away
          : null;

    if (winner && bonusPrediction.predicted_winner_team === winner) {
      points += 10;
    }
  }

  if (bonusPrediction.predicted_player) {
    const record = playerGoals.find(
      (p) => p.player_name === bonusPrediction.predicted_player,
    );
    if (record) {
      points += record.goals_scored ?? 0;
    }
  }

  return points;
}

export async function calculateTotalPoints(supabase, userId) {
  const [predictionsRes, bonusRes, matchesRes, playerGoalsRes] = await Promise.all([
    supabase.from('predictions').select('*').eq('user_id', userId),
    supabase.from('bonus_predictions').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('matches').select('*'),
    supabase.from('players_goals').select('*').then((r) => r.error ? { data: [] } : r),
  ]);

  const matches = matchesRes.data ?? [];
  const matchesById = Object.fromEntries(matches.map((m) => [m.id, m]));
  const playerGoals = playerGoalsRes.data ?? [];

  let total = 0;

  for (const prediction of predictionsRes.data ?? []) {
    const match = matchesById[prediction.match_id];
    if (match) {
      total += calculateMatchPoints(prediction, match);
    }
  }

  total += calculateBonusPoints(bonusRes.data, matches, playerGoals);

  return total;
}

export function formatStage(stage) {
  const labels = {
    group: 'Group Stage',
    round_of_16: 'Round of 16',
    quarterfinal: 'Quarterfinal',
    semifinal: 'Semifinal',
    final: 'Final',
  };
  return labels[stage] ?? stage;
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
                {scorerName ? `Střelec: ${scorerName}` : 'Celkem za střelce'}
              </span>
              <span className="text-sm font-bold text-gray-900">{scorerPoints} b.</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Celkem za vítěze</span>
              <span className="text-sm font-bold text-gray-900">{winnerPoints} b.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}