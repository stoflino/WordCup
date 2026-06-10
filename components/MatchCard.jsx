'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatStage } from '@/lib/scoring';
import { isMatchLocked } from '@/lib/auth';

export default function MatchCard({ match, prediction, onSave, saving }) {
  const locked = isMatchLocked(match);
  const [home, setHome] = useSyncedState(prediction?.predicted_home_score ?? '');
  const [away, setAway] = useSyncedState(prediction?.predicted_away_score ?? '');
  const [lockMessage, setLockMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) {
      setLockMessage('Tento zápas je uzamčen — tip nelze upravit.');
      return;
    }
    setLockMessage('');
    onSave(match.id, Number(home), Number(away));
  };

  const startTime = match.start_time
    ? new Date(match.start_time).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Čas zatím neznámý';

  return (
    <article
      className={`card p-6 ${locked ? 'opacity-70' : ''}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <span className="badge-accent">{formatStage(match.stage)}</span>
          <p className="mt-2 text-xs text-gray-500">{startTime}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {locked && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
              Locked
            </span>
          )}
          {match.is_finished && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              FT {match.home_score}:{match.away_score}
            </span>
          )}
        </div>
      </div>

      <div className="mb-5 text-center">
        <p className="text-lg font-semibold text-gray-900">
          {match.team_home}{' '}
          <span className="font-normal text-gray-400">vs</span>{' '}
          {match.team_away}
        </p>
      </div>

      {lockMessage && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
          {lockMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center justify-center gap-3">
        <input
          type="number"
          min="0"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          disabled={locked}
          required={!locked}
          className="input-field w-14 py-2 text-center text-lg font-semibold"
          aria-label={`${match.team_home} score`}
        />
        <span className="text-gray-400">:</span>
        <input
          type="number"
          min="0"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          disabled={locked}
          required={!locked}
          className="input-field w-14 py-2 text-center text-lg font-semibold"
          aria-label={`${match.team_away} score`}
        />
        <button
          type="submit"
          disabled={locked || saving}
          className="btn-primary ml-2"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link href={`/match/${match.id}`} className="link-accent text-sm">
          View details →
        </Link>
      </div>
    </article>
  );
}

function useSyncedState(initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  return [value, setValue];
}
