'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import BonusPredictionForm from '@/components/BonusPredictionForm';
import { useAuth } from '@/context/AuthContext';
import { isBonusLocked } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function BonusPredictionsPage() {
  const { user } = useAuth();
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const loadData = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bonus_predictions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setBonus(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveBonus = async ({ predicted_winner_team, predicted_player }) => {
    if (isBonusLocked()) {
      showMessage('Lhůta pro bonusové tipy vypršela — tip nelze uložit.', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      user_id: user.id,
      predicted_winner_team: predicted_winner_team || null,
      predicted_player: predicted_player || null,
    };

    const { data, error } = bonus?.id
      ? await supabase.from('bonus_predictions').update(payload).eq('id', bonus.id).select().single()
      : await supabase.from('bonus_predictions').insert(payload).select().single();

    setSaving(false);

    if (error) {
      showMessage(error.message, 'error');
      return;
    }

    setBonus(data);
    showMessage('Bonusové tipy uloženy!');
  };

  return (
    <AuthGuard>
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Bonusové tipy</h1>
        <p className="mt-2 text-gray-500">Tip na vítěze turnaje a nejlepšího střelce</p>
      </div>

      {message && (
        <p
          className={`mx-auto mb-6 max-w-md ${
            messageType === 'error' ? 'msg-error' : 'msg-success'
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Načítám…</p>
      ) : (
        <BonusPredictionForm bonus={bonus} onSave={saveBonus} saving={saving} />
      )}
    </AuthGuard>
  );
}
