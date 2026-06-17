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
