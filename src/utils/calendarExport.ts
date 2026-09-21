import { Booking } from '../types';

/**
 * Parses booking day and slot into a real future or current Date
 * e.g., day: "اليوم" or "اليوم، 10 سبتمبر" or "غداً، 11 سبتمبر" or "الخميس"
 * and slot: "07:30 م" or "04:00 ص"
 */
function parseBookingDateTime(dayStr: string, slotStr: string): { start: Date; end: Date } {
  const now = new Date();
  let targetDate = new Date(now);

  // Check day offsets
  if (dayStr.includes('اليوم')) {
    // today
  } else if (dayStr.includes('غداً') || dayStr.includes('غدا')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (dayStr.includes('بعد غد')) {
    targetDate.setDate(targetDate.getDate() + 2);
  } else {
    // Default to tomorrow if not today or undefined
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Parse slot string: e.g. "07:30 م" or "08:00 ص" or "7:00 PM"
  let hours = 18; // default 6:00 PM
  let minutes = 0;

  if (slotStr) {
    const isPM = slotStr.includes('م') || slotStr.toLowerCase().includes('pm');
    const isAM = slotStr.includes('ص') || slotStr.toLowerCase().includes('am');
    
    // Extract numbers: e.g. "07:30"
    const match = slotStr.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hours = h;
      minutes = m;
    } else {
      const singleHour = slotStr.match(/(\d{1,2})/);
      if (singleHour) {
        let h = parseInt(singleHour[1], 10);
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        hours = h;
      }
    }
  }

  targetDate.setHours(hours, minutes, 0, 0);

  // If time already passed today, advance to next week or tomorrow
  if (targetDate.getTime() < now.getTime()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const startDate = new Date(targetDate);
  const endDate = new Date(targetDate.getTime() + 45 * 60 * 1000); // 45 minutes appointment duration

  return { start: startDate, end: endDate };
}

/**
 * Generate Google Calendar Web URL for direct 1-click addition with exact booking time
 */
export function generateGoogleCalendarUrl(booking: Booking): string {
  const title = encodeURIComponent(`موعد كشف طبي - ${booking.doctorName} (${booking.specialty})`);
  const location = encodeURIComponent(`${booking.location}`);
  const details = encodeURIComponent(
    `حجز كشف دكتورنا الطبي\nرقم الحجز: #${booking.id}\nالطبيب: ${booking.doctorTitle} ${booking.doctorName}\nالتخصص: ${booking.specialty}\nالمريض: ${booking.patientName}\nالموعد: ${booking.day} - ${booking.slot}\nالعنوان: ${booking.location}`
  );

  const { start, end } = parseBookingDateTime(booking.day, booking.slot);

  const formatGoogleTime = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const dates = `${formatGoogleTime(start)}/${formatGoogleTime(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&add=1`;
}

/**
 * Generate and trigger download of .ics file for Apple Calendar, Outlook, and Android with accurate time
 */
export function downloadIcsCalendarFile(booking: Booking): void {
  const now = new Date();
  const { start, end } = parseBookingDateTime(booking.day, booking.slot);

  const formatIcsTime = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Doctorna Egypt//Medical Appointments//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:doctorna-booking-${booking.id}-${Date.now()}@doctorna.eg`,
    `DTSTAMP:${formatIcsTime(now)}`,
    `DTSTART:${formatIcsTime(start)}`,
    `DTEND:${formatIcsTime(end)}`,
    `SUMMARY:موعد كشف طبي: ${booking.doctorName} (${booking.specialty})`,
    `DESCRIPTION:حجز كشف مؤكد برقم #${booking.id}\\nالطبيب: ${booking.doctorName}\\nالمريض: ${booking.patientName}\\nالموعد: ${booking.day} - ${booking.slot}`,
    `LOCATION:${booking.location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:تذكير بموعد الكشف الطبي بعد ساعتين',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:تذكير بموعد الكشف الطبي غداً',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `appointment-${booking.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
