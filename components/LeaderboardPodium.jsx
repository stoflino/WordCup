const PODIUM_CONFIG = {
  1: {
    medal: '🥇',
    order: 'order-2',
    minHeight: 'min-h-[11rem]',
    card: 'bg-gradient-to-b from-teal-400 to-blue-500 text-white shadow-lg ring-2 ring-teal-300/50',
    name: 'text-lg font-bold',
    points: 'text-2xl font-bold',
    label: '1.',
  },
  2: {
    medal: '🥈',
    order: 'order-1',
    minHeight: 'min-h-[9rem]',
    card: 'bg-gradient-to-b from-teal-50 to-blue-50 text-gray-900 shadow-md',
    name: 'text-base font-semibold',
    points: 'text-xl font-bold text-teal-600',
    label: '2.',
  },
  3: {
    medal: '🥉',
    order: 'order-3',
    minHeight: 'min-h-[7.5rem]',
    card: 'bg-gradient-to-b from-cyan-50 to-blue-50 text-gray-900 shadow-md',
    name: 'text-base font-semibold',
    points: 'text-xl font-bold text-blue-500',
    label: '3.',
  },
};

function PodiumSpot({ place, player, isCurrentUser }) {
  const config = PODIUM_CONFIG[place];

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-end sm:max-w-[11rem] ${config.order}`}
    >
      <div
        className={`flex w-full flex-col items-center justify-end rounded-xl px-4 py-5 text-center transition-transform ${config.minHeight} ${config.card} ${
          place === 1 ? 'sm:scale-105' : ''
        }`}
      >
        <span className="text-3xl" aria-hidden>
          {config.medal}
        </span>
        <p className={`mt-2 ${config.name}`}>
          {player.name}
          {isCurrentUser && (
            <span className={`ml-1 text-xs font-normal ${place === 1 ? 'text-teal-100' : 'text-teal-600'}`}>
              (ty)
            </span>
          )}
        </p>
        <p className={`mt-1 ${config.points}`}>{player.points} b.</p>
      </div>
      <div className="mt-2 text-sm font-medium text-gray-500">{config.label} místo</div>
    </div>
  );
}

export default function LeaderboardPodium({ rows, currentUserId }) {
  if (rows.length === 0) return null;

  const [first, second, third] = rows;

  return (
    <section className="mb-12" aria-label="Top 3 hráči">
      <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-gray-500">
        Top 3
      </h2>
      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {second && (
          <PodiumSpot place={2} player={second} isCurrentUser={second.id === currentUserId} />
        )}
        <PodiumSpot place={1} player={first} isCurrentUser={first.id === currentUserId} />
        {third && (
          <PodiumSpot place={3} player={third} isCurrentUser={third.id === currentUserId} />
        )}
      </div>
    </section>
  );
}
