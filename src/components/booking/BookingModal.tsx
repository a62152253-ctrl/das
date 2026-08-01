import React, { useState, useEffect } from 'react';
import { Company, Service, Booking } from '../../types';
import { generateAvailableSlots, calculateEndTime, createBooking } from '../../lib/BookingEngine';
import { getFirebaseDb } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../lib/AuthContext';
import { Calendar, Clock, X, Check, User, Phone, Mail, AlertCircle } from 'lucide-react';
import { addToast } from '../ui/Toast';

interface BookingModalProps {
  company: Company;
  services: Service[];
  initialServiceId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  company,
  services,
  initialServiceId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services.length > 0 ? services[0].id : '')
  );
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [clientName, setClientName] = useState<string>(user?.displayName || '');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>(user?.email || '');
  const [notes, setNotes] = useState<string>('');

  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const activeService = services.find(s => s.id === selectedServiceId);
  const durationMin = activeService?.durationMin || 45;

  // Fetch company's bookings for selected date to find conflicts
  useEffect(() => {
    let isMounted = true;
    const fetchCompanyBookings = async () => {
      if (!company.uid || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const db = getFirebaseDb();
        const q = query(
          collection(db, 'bookings'),
          where('companyId', '==', company.uid),
          where('date', '==', selectedDate)
        );
        const snap = await getDocs(q);
        const list: Booking[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        if (isMounted) {
          setExistingBookings(list);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    fetchCompanyBookings();
    return () => { isMounted = false; };
  }, [company.uid, selectedDate]);

  // Recalculate available slots
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }
    const slots = generateAvailableSlots(company, selectedDate, existingBookings, durationMin);
    setAvailableSlots(slots);
    if (!slots.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [company, selectedDate, existingBookings, durationMin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Zaloguj się, aby zarezerwować wizytę.');
      return;
    }
    if (!activeService) {
      setErrorMsg('Wybierz usługę.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setErrorMsg('Wybierz datę i wolną godzinę.');
      return;
    }
    if (!clientName || !clientPhone) {
      setErrorMsg('Uzupełnij swoje imię i numer telefonu.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const endTime = calculateEndTime(selectedTime, durationMin);
      await createBooking({
        companyId: company.uid,
        companyName: company.companyName,
        clientId: user.uid,
        clientName,
        clientPhone,
        clientEmail,
        serviceId: activeService.id,
        serviceName: activeService.name,
        servicePrice: activeService.price,
        serviceDurationMin: durationMin,
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        status: 'pending',
        notes
      });

      addToast(`Złożono rezerwację na ${selectedDate} o godz. ${selectedTime}!`, 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMsg(err.message || 'Wystąpił błąd podczas rezerwacji.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rezerwacja Wizyty</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{company.companyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Service selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Wybierz usługę
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.price} zł ({s.durationMin || 45} min)
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Date selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" /> Wybierz dzień
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
            />
          </div>

          {/* Step 3: Available Hours Grid */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" /> Dostępne godziny ({durationMin} min)
            </label>

            {loadingSlots ? (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">Sprawdzanie wolnych terminów...</div>
            ) : availableSlots.length === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-xl text-xs border border-amber-200 dark:border-amber-800">
                Brak wolnych terminów w wybranym dniu lub firma jest nieczynna. Wybierz inną datę z kalendarza.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 sidebar-scrollbar">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedTime === slot
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Contact details */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dane kontaktowe do wizyty
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Imię i nazwisko</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="np. Jan Kowalski"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Numer telefonu</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="np. 500 100 200"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Dodatkowe uwagi (opcjonalnie)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodatkowe informacje dla wykonawcy..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTime}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {submitting ? 'Rezerwowanie...' : 'Potwierdź rezerwację'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
