export const INDIA_TIMEZONE = 'Asia/Kolkata';

export function indiaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function nowInIndiaMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: INDIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const hour = Number.parseInt(values.hour, 10) % 24;
  const minute = Number.parseInt(values.minute, 10);
  return hour * 60 + minute;
}

export function upcomingIndiaDates(days = 3) {
  const result = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = indiaDateString(d);
    let label;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = new Intl.DateTimeFormat('en-IN', {
        timeZone: INDIA_TIMEZONE,
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }).format(d);
    }
    result.push({ date: dateStr, label });
  }
  return result;
}

function parseTimeToMinutes(raw) {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  if (!match) return null;
  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2] || '0', 10);
  const meridiem = match[3];
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (hours < 0 || hours > 24 || minutes < 0 || minutes >= 60) return null;
  return hours * 60 + minutes;
}

export function formatMinutesTo12Hour(totalMinutes) {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${meridiem}`;
}

export function parseOpeningHours(openingHours) {
  if (!openingHours || typeof openingHours !== 'string') {
    return { openMinutes: 8 * 60 + 30, closeMinutes: 20 * 60 };
  }
  const parts = openingHours.split(/\s*[-–to]+\s*/i);
  if (parts.length < 2) {
    return { openMinutes: 8 * 60 + 30, closeMinutes: 20 * 60 };
  }
  const openMinutes = parseTimeToMinutes(parts[0]);
  const closeMinutes = parseTimeToMinutes(parts[1]);
  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return { openMinutes: 8 * 60 + 30, closeMinutes: 20 * 60 };
  }
  return { openMinutes, closeMinutes };
}

export function generateCanteenPickupSlots(canteen, dateStr, existingSlots = [], intervalMinutes = 30) {
  if (!canteen) return [];
  const { openMinutes, closeMinutes } = parseOpeningHours(canteen.openingHours);
  const todayStr = indiaDateString();
  const currentMinutes = nowInIndiaMinutes();
  const isToday = dateStr === todayStr;
  const isPastDay = dateStr < todayStr;

  const existingByTime = new Map(
    (existingSlots || []).map(slot => [String(slot.time || '').trim().toUpperCase(), slot])
  );

  const slots = [];
  for (let start = openMinutes; start + intervalMinutes <= closeMinutes; start += intervalMinutes) {
    const end = start + intervalMinutes;
    const startTime = formatMinutesTo12Hour(start);
    const endTime = formatMinutesTo12Hour(end);
    const timeLabel = `${startTime} - ${endTime}`;

    const matched = existingByTime.get(timeLabel.toUpperCase());
    const capacity = matched?.capacity ?? 25;
    const currentBookings = matched?.currentBookings ?? 0;
    const isAvailable = matched ? matched.isAvailable !== false : true;
    const remaining = Math.max(0, capacity - currentBookings);
    const isFull = !isAvailable || remaining === 0;
    const isPast = isPastDay || (isToday && start <= currentMinutes);

    let status = 'available';
    if (isPast) status = 'past';
    else if (isFull) status = 'full';
    else if (remaining <= 5) status = 'limited';

    slots.push({
      id: matched?.id || `gen-${canteen.id}-${dateStr}-${start}`,
      canteenId: canteen.id,
      serviceDate: dateStr,
      time: timeLabel,
      startTime,
      endTime,
      startMinutes: start,
      endMinutes: end,
      capacity,
      currentBookings,
      remaining,
      isAvailable,
      isFull,
      isPast,
      status
    });
  }

  return slots;
}
