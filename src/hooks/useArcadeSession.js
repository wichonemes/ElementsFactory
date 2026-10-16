import { useState, useEffect } from 'react';
import {
  getArcadeStatus,
  spendArcadeCredit,
  exchangeCoinsForCredits,
  addArcadeCoins,
  redeemArcadeCoupon,
  formatRefillTime,
  formatSessionTime
} from '../utils/arcadeCreditsManager';

export function useArcadeSession() {
  const [status, setStatus] = useState(() => getArcadeStatus());

  useEffect(() => {
    // 1. Escuchar actualizaciones globales de otros componentes
    const handleUpdate = (e) => {
      if (e?.detail) {
        setStatus(e.detail);
      } else {
        setStatus(getArcadeStatus());
      }
    };

    window.addEventListener('artesano_arcade_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // 2. Temporizador de 1 segundo para la recarga en sesión en pantalla
    const timer = setInterval(() => {
      setStatus(getArcadeStatus());
    }, 1000);

    return () => {
      window.removeEventListener('artesano_arcade_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(timer);
    };
  }, []);

  return {
    credits: status.credits,
    coins: status.coins,
    activeCoupon: status.activeCoupon,
    secondsUntilRefill: status.secondsUntilRefill,
    refillTimeFormatted: formatRefillTime(status.secondsUntilRefill),
    sessionRemainingSeconds: status.sessionRemainingSeconds || 3600,
    sessionTimeFormatted: formatSessionTime(status.sessionRemainingSeconds || 3600),
    sessionExpired: status.sessionExpired || false,
    maxCredits: status.maxCredits,
    costPerGame: status.costPerGame || 1,
    spendCredit: spendArcadeCredit,
    exchangeCoinsForCredits,
    addCoins: addArcadeCoins,
    redeemCoupon: redeemArcadeCoupon
  };
}
