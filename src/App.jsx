import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // import klienta

// Definice zápasů (id musí odpovídat číslům)
const ZAPASY = [
  { id: 1, domaci: 'Sparta', hoste: 'Slavia' },
  { id: 2, domaci: 'Real Madrid', hoste: 'Barcelona' },
  { id: 3, domaci: 'Arsenal', hoste: 'Chelsea' },
];

export default function Tipovacka() {
  const [jmeno, setJmeno] = useState('');
  const [pin, setPin] = useState('');
  const [tipyForm, setTipyForm] = useState({});
  const [vsechnyTipy, setVsechnyTipy] = useState([]);
  const [nacitaSe, setNacitaSe] = useState(false);

  // Funkce pro načtení všech tipů z databáze
  const nactiTipyZDatabaze = async () => {
    const { data, error } = await supabase.from('tipy').select('*');
    if (error) console.error('Chyba při načítání:', error);
    else setVsechnyTipy(data);
  };

  // Načíst data hned při otevření stránky
  useEffect(() => {
    nactiTipyZDatabaze();
  }, []);

  const handleInputChange = (zapasId, tym, hodnota) => {
    setTipyForm(prev => ({
      ...prev,
      [zapasId]: { ...prev[zapasId], [tym]: parseInt(hodnota) || 0 }
    }));
  };

  // Odeslání dat do Supabase
  const odeslatTipy = async (e) => {
    e.preventDefault();
    if (!jmeno || !pin) return alert('Vyplň jméno a PIN!');
    setNacitaSe(true);

    // Připravíme řádky pro databázi (každý zápas = jeden řádek)
    const radkyK_Ulozeni = ZAPASY.map(zapas => {
      const t = tipyForm[zapas.id] || { domaci: 0, hoste: 0 };
      return {
        jmeno: jmeno.trim(),
        pin: pin.trim(),
        zapas_id: zapas.id,
        tip_domaci: t.domaci,
        tip_hoste: t.hoste
      };
    });

    // Uložíme do Supabase. Upsert se rozhodne podle jména, pinu a zápasu.
    const { error } = await supabase
      .from('tipy')
      .upsert(radkyK_Ulozeni, { onConflict: 'jmeno,pin,zapas_id' }); 

    setNacitaSe(false);

    if (error) {
      alert('Chyba při ukládání: ' + error.message);
    } else {
      alert('Tipy byly úspěšně uloženy/aktualizovány!');
      nactiTipyZDatabaze(); // znovu načteme tabulku výsledků
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🏆 Společná Tipovačka</h2>

      {/* FORMULÁŘ */}
      <form onSubmit={odeslatTipy} style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="Tvoje Jméno" value={jmeno} onChange={e => setJmeno(e.target.value)} required style={{ flex: 2, padding: '8px' }} />
          <input type="password" placeholder="Čtyřmístný PIN (pro změny)" maxLength="4" value={pin} onChange={e => setPin(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
        </div>

        <h3>Natipuj zápasy:</h3>
        {ZAPASY.map(zapas => (
          <div key={zapas.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', background: 'white', padding: '10px', borderRadius: '5px' }}>
            <span style={{ width: '150px', textAlign: 'right' }}>{zapas.domaci}</span>
            <input type="number" min="0" required onChange={e => handleInputChange(zapas.id, 'domaci', e.target.value)} style={{ width: '50px', textAlign: 'center' }} />
            :
            <input type="number" min="0" required onChange={e => handleInputChange(zapas.id, 'hoste', e.target.value)} style={{ width: '50px', textAlign: 'center' }} />
            <span style={{ width: '150px', textAlign: 'left' }}>{zapas.hoste}</span>
          </div>
        ))}

        <button type="submit" disabled={nacitaSe} style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {nacitaSe ? 'Ukládám...' : 'Uložit / Změnit moje tipy'}
        </button>
      </form>

      {/* PRŮBĚŽNÁ TABULKA VŠECH TIPŮ */}
      <h3 style={{ marginTop: '30px' }}>Už natipovali:</h3>
      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        {vsechnyTipy.length === 0 ? <p>Zatím nikdo netipoval.</p> : (
          vsechnyTipy.map((t, index) => {
            const zapas = ZAPASY.find(z => z.id === t.zapas_id);
            return (
              <div key={index} style={{ borderBottom: '1px solid #eee', padding: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
                <strong>{t.jmeno}</strong>
                <span>{zapas?.domaci} vs {zapas?.hoste}</span>
                <span style={{ background: '#eee', padding: '2px 8px', borderRadius: '3px' }}>{t.tip_domaci}:{t.tip_hoste}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
