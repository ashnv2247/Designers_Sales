import { OperatingHours } from '@/types/shop';

const DAY_ORDER: OperatingHours['day'][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface HoursStatusResult {
  isOpen: boolean;
  statusBadgeText: string;
  closingTime?: string;
  nextOpenTime?: string;
  nextOpenDay?: string;
}

/**
 * Format 24h time "17:00" or "09:30" to "5:00 PM" or "9:30 AM"
 */
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Parses time string "HH:MM" into minutes from midnight
 */
export function timeToMinutes(time24: string): number {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Calculates current open/closed status given operating hours and an optional mock Date
 * Default timezone context: Australia/Melbourne or local
 */
export function calculateShopStatus(
  hours: OperatingHours[],
  mockDate?: Date
): HoursStatusResult {
  const now = mockDate ? new Date(mockDate) : new Date();

  // Day index 0=Sun, 1=Mon, ..., 6=Sat
  const currentDayName = DAY_ORDER[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.day === currentDayName);

  // Check if open today right now
  if (todayHours && !todayHours.isClosed) {
    const openMin = timeToMinutes(todayHours.open);
    const closeMin = timeToMinutes(todayHours.close);

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      const formattedClose = formatTime12h(todayHours.close);
      return {
        isOpen: true,
        statusBadgeText: `Open Now · Closes ${formattedClose}`,
        closingTime: formattedClose,
      };
    }
  }

  // If closed right now, find next open day and time
  const currentDayIndex = now.getDay();
  for (let offset = 0; offset < 7; offset++) {
    const nextDayIndex = (currentDayIndex + offset) % 7;
    const nextDayName = DAY_ORDER[nextDayIndex];
    const nextHours = hours.find((h) => h.day === nextDayName);

    if (nextHours && !nextHours.isClosed) {
      const openMin = timeToMinutes(nextHours.open);
      // If it's today and opening is still ahead
      if (offset === 0 && currentMinutes < openMin) {
        const formattedOpen = formatTime12h(nextHours.open);
        return {
          isOpen: false,
          statusBadgeText: `Closed · Opens Today ${formattedOpen}`,
          nextOpenTime: formattedOpen,
          nextOpenDay: 'Today',
        };
      } else if (offset > 0) {
        const formattedOpen = formatTime12h(nextHours.open);
        const dayLabel = offset === 1 ? 'Tomorrow' : nextDayName;
        return {
          isOpen: false,
          statusBadgeText: `Closed · Opens ${dayLabel} ${formattedOpen}`,
          nextOpenTime: formattedOpen,
          nextOpenDay: dayLabel,
        };
      }
    }
  }

  return {
    isOpen: false,
    statusBadgeText: 'Closed for the season',
  };
}

