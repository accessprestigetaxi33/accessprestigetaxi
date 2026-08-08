/**
 * useDriverArrival — Le chauffeur déclenche "J'arrive dans ~5 min".
 * 1) Met à jour reservations.status → 'en_route' via une server function
 *    protégée par le jeton chauffeur (aucune écriture directe côté navigateur :
 *    les RLS interdisent la modification des réservations depuis le client).
 * 2) Envoie une push au client via notifyReservationStatus (server function)
 */
import { useCallback, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { notifyReservationStatus } from '@/lib/push.functions';
import { driverSetReservationStatus } from '@/lib/driver-courses.functions';
import { getDriverToken } from '@/lib/driver-token';

type ArrivalStatus = 'idle' | 'sending' | 'sent' | 'error';

export function useDriverArrival() {
  const [status, setStatus] = useState<ArrivalStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const notify = useServerFn(notifyReservationStatus);
  const setReservationStatus = useServerFn(driverSetReservationStatus);

  const notifyArrival = useCallback(
    async (reservationId: string): Promise<boolean> => {
      if (!reservationId) return false;
      const token = getDriverToken();
      if (!token) {
        setError('Session chauffeur expirée');
        setStatus('error');
        return false;
      }
      setStatus('sending');
      setError(null);
      try {
        await setReservationStatus({
          data: { token, reservation_id: reservationId, status: 'en_route' },
        });

        try {
          await notify({ data: { reservation_id: reservationId, status: 'en_route' } });
        } catch (pushErr) {
          // Best-effort : le status est déjà à jour
          console.warn('[useDriverArrival] push failed:', pushErr);
        }

        setStatus('sent');
        return true;
      } catch (err: any) {
        console.error('[useDriverArrival] error:', err);
        setError(String(err?.message ?? err));
        setStatus('error');
        return false;
      }
    },
    [notify, setReservationStatus],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    notifyArrival,
    status,
    error,
    sending: status === 'sending',
    sent: status === 'sent',
    reset,
  };
}
