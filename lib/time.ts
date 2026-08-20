/**
 * Time calculation and formatting helper utilities
 */

export function formatDigit(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatMilliseconds(ms: number): string {
  const hundredths = Math.floor((ms % 1000) / 10);
  return formatDigit(hundredths);
}

export function formatStopwatchTime(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
  formatted: string;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = formatMilliseconds(ms);

  const hStr = formatDigit(hours);
  const mStr = formatDigit(minutes);
  const sStr = formatDigit(seconds);

  const formatted = hours > 0
    ? `${hStr}:${mStr}:${sStr}.${milliseconds}`
    : `${mStr}:${sStr}.${milliseconds}`;

  return {
    hours: hStr,
    minutes: mStr,
    seconds: sStr,
    milliseconds,
    formatted
  };
}

export function formatTimerTime(secondsRemaining: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const hStr = formatDigit(hours);
  const mStr = formatDigit(minutes);
  const sStr = formatDigit(seconds);

  const formatted = hours > 0
    ? `${hStr}:${mStr}:${sStr}`
    : `${mStr}:${sStr}`;

  return {
    hours: hStr,
    minutes: mStr,
    seconds: sStr,
    formatted
  };
}

export function getFormattedClock(date: Date, is24Hour: boolean, timezone?: string) {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: !is24Hour,
    timeZone: timezone || undefined
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(date);

  let hours = '00';
  let minutes = '00';
  let seconds = '00';
  let dayPeriod = '';

  parts.forEach((part) => {
    if (part.type === 'hour') hours = part.value.padStart(2, '0');
    if (part.type === 'minute') minutes = part.value.padStart(2, '0');
    if (part.type === 'second') seconds = part.value.padStart(2, '0');
    if (part.type === 'dayPeriod') dayPeriod = part.value.toUpperCase();
  });

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: timezone || undefined
  };

  const fullDateStr = new Intl.DateTimeFormat('en-US', dateOptions).format(date);

  // Timezone display name
  let tzName = '';
  try {
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      timeZoneName: 'short'
    });
    const tzParts = tzFormatter.formatToParts(date);
    const tzPart = tzParts.find((p) => p.type === 'timeZoneName');
    tzName = tzPart ? tzPart.value : '';
  } catch (e) {
    tzName = timezone || '';
  }

  return {
    hours,
    minutes,
    seconds,
    dayPeriod,
    fullDateStr,
    timezoneName: tzName
  };
}
