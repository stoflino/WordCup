'use client';

import { useEffect, useState } from 'react';
import { BONUS_DEADLINE, isBonusLocked } from '@/lib/constants';

export default function BonusPredictionForm({ bonus, onSave, saving }) {
  const locked = isBonusLocked();
  const [winner, setWinner] = useState(bonus?.predicted_winner_team ?? '');
  const [player, setPlayer] = useState(bonus?.predicted_player ?? '');
  const [lockMessage, setLockMessage] = useState('');

  useEffect(() => {
    setWinner(bonus?.predicted_winner_team ?? '');
    setPlayer(bonus?.predicted_player ?? '');
  }, [bonus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) {
      setLockMessage('Lhůta pro bonusové tipy vypršela — tip nelze upravit.');
      return;
    }
    setLockMessage('');
    onSave({
      predicted_winner_team: winner.trim(),
      predicted_player: player.trim(),
    });
  };

  const deadlineLabel = BONUS_DEADLINE.toLocaleString('cs-CZ', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <section className={`card mx-auto w-full max-w-md p-8 ${locked ? 'opacity-70' : ''}`}>
      <h2 className="text-lg font-semibold text-gray-900">Bonusové tipy</h2>
      <p className="mt-2 text-sm text-gray-500">
        Vítěz turnaje (+10 bodů), Nejlepší střelec (+ ? bodů)
      </p>
      <p className="mt-1 text-xs text-gray-400">Uzávěrka: {deadlineLabel}</p>

      {locked && (
        <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Bonusové tipy jsou uzamčeny.
        </p>
      )}

      {lockMessage && (
        <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {lockMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="winner" className="mb-2 block text-sm font-medium text-gray-700">
            Vítěz turnaje
          </label>
          <input
            id="winner"
            type="text"
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            disabled={locked}
            placeholder="Např. Brazílie"
            className="input-field w-full"
          />
          <label htmlFor="player" className="mt-1 text-xs text-gray-400">
            Dostaneš 10 bodů, když tvůj tým vyhraje wordcup.
          </label>
        </div>

        <div>
          <label htmlFor="player" className="mb-2 block text-sm font-medium text-gray-700">
            Nejlepší střelec
          </label>
          <input
            id="player"
            type="text"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            disabled={locked}
            placeholder="Např. Messi"
            className="input-field w-full"
          />
          <label htmlFor="player" className="mt-1 text-xs text-gray-400">
            Dostaneš tolik bodů, kolik dá v turnaji gólů. (Hráč nemusí být nejlepší střelec turnaje.)
          </label>
        </div>

        <button
          type="submit"
          disabled={locked || saving || (!winner.trim() && !player.trim())}
          className="btn-primary w-full"
        >
          {saving ? 'Ukládám…' : 'Uložit bonusové tipy'}
        </button>
      </form>
    </section>
  );
}
