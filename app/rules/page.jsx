import AuthGuard from '@/components/AuthGuard';

export const metadata = {
  title: 'Pravidla — Tipovačka WorldCup 2026',
};

function RuleSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="space-y-2 leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

function RulesContent() {
  return (
    <div className="card p-10">
      <h1 className="brand-title text-3xl">Pravidla tipovačky</h1>

      <div className="mt-10 space-y-10">
        <RuleSection title="Tipování zápasů">
          <p>Každý hráč tipuje přesný výsledek každého zápasu (góly obou týmů)</p>
          <p>Tip lze upravit pouze do začátku zápasu</p>
          <p>Po začátku zápasu je tip uzamčen</p>
        </RuleSection>

        <RuleSection title="Bodování">
          <p>Přesný výsledek: <strong className="text-gray-800">2 body</strong></p>
          <p>Správný vítěz nebo remíza: <strong className="text-gray-800">1 bod</strong></p>
        </RuleSection>

        <RuleSection title="Playoff násobiče">
          <ul className="list-disc space-y-1 pl-5">
            <li>Osmifinále: <strong className="text-gray-800">2× body</strong></li>
            <li>Čtvrtfinále: <strong className="text-gray-800">3× body</strong></li>
            <li>Semifinále: <strong className="text-gray-800">4× body</strong></li>
            <li>Finále: <strong className="text-gray-800">5× body</strong></li>
          </ul>
        </RuleSection>

        <RuleSection title="Bonusové tipy">
          <p>
            Tip na vítěze turnaje: správný tip ={' '}
            <strong className="text-gray-800">+10 bodů</strong>
          </p>
          <p>Tip na hráče: získáš tolik bodů, kolik hráč dá gólů v turnaji</p>
        </RuleSection>

        <RuleSection title="Zobrazení tipů">
          <p>Před začátkem zápasu nejsou vidět tipy ostatních hráčů</p>
          <p>Po skončení zápasu jsou všechny tipy veřejné</p>
        </RuleSection>

        <RuleSection title="Vklad">
          <p>
            Každý hráč zaplatí vstupní poplatek{' '}
            <strong className="text-gray-800">100 Kč</strong>
          </p>
        </RuleSection>

        <RuleSection title="Výhry">
          <p className="font-medium text-gray-700">
            Součet všech vstupních poplatků se rozdělí mezi vítěze
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>1. místo → <strong className="text-gray-800">50 %</strong></li>
            <li>2. místo → <strong className="text-gray-800">30 %</strong></li>
            <li>3. místo → <strong className="text-gray-800">20 %</strong></li>
          </ul>
        </RuleSection>
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <AuthGuard>
      <RulesContent />
    </AuthGuard>
  );
}
