/*'use client';

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

*/

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
 
  // Porovnáváme rozpracovanou hodnotu v inputu s posledně uloženým tipem.
  // '' vs undefined by se jinak vyhodnotilo jako "změna" hned po načtení, proto normalizujeme na string.
  const savedHome = prediction?.predicted_home_score ?? '';
  const savedAway = prediction?.predicted_away_score ?? '';
  const hasUnsavedChanges =
    String(home) !== String(savedHome) || String(away) !== String(savedAway);
 
  const saveStatus = !prediction
    ? 'empty' // ještě nikdy nebyl tip uložen
    : hasUnsavedChanges
    ? 'unsaved' // tip existuje, ale uživatel ho od poslední uložené verze změnil
    : 'saved'; // aktuální hodnoty odpovídají tomu, co je v DB
 
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
      className={`card p-6 ${locked ? 'opacity-70' : ''} ${
        saveStatus === 'unsaved' ? 'ring-1 ring-amber-200' : ''
      }`}
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
          {!match.is_finished && !locked && <SaveStatusBadge status={saveStatus} />}
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
          className={`input-field w-14 py-2 text-center text-lg font-semibold ${
            saveStatus === 'unsaved' ? 'border-amber-300' : ''
          }`}
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
          className={`input-field w-14 py-2 text-center text-lg font-semibold ${
            saveStatus === 'unsaved' ? 'border-amber-300' : ''
          }`}
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
 
function SaveStatusBadge({ status }) {
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
        <CheckIcon />
        Uloženo
      </span>
    );
  }
 
  if (status === 'unsaved') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
        <AlertIcon />
        Neuloženo
      </span>
    );
  }
 
  // status === 'empty' -> ještě žádný tip, nezobrazujeme nic (ať karta není přehlcená)
  return null;
}
 
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.193a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
 
function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
 
function useSyncedState(initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);
  return [value, setValue];
}
