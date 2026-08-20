export interface CityTimezone {
  id: string;
  city: string;
  country: string;
  timezone: string;
  flag: string;
  popular?: boolean;
}

export const POPULAR_TIMEZONES: CityTimezone[] = [
  { id: 'london', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', flag: '🇬🇧', popular: true },
  { id: 'new-york', city: 'New York', country: 'United States', timezone: 'America/New_York', flag: '🇺🇸', popular: true },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', flag: '🇦🇪', popular: true },
  { id: 'karachi', city: 'Karachi', country: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰', popular: true },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵', popular: true },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', popular: true },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺', popular: true },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦', popular: true }
];

export const ALL_TIMEZONES: CityTimezone[] = [
  ...POPULAR_TIMEZONES,
  { id: 'los-angeles', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { id: 'chicago', city: 'Chicago', country: 'United States', timezone: 'America/Chicago', flag: '🇺🇸' },
  { id: 'paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { id: 'istanbul', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷' },
  { id: 'mumbai', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { id: 'beijing', city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { id: 'hong-kong', city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { id: 'buenos-aires', city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' }
];

export function getTimezoneOffsetFormatted(timezone: string, now: Date = new Date()): string {
  try {
    const userOffsetMin = -now.getTimezoneOffset();
    
    // Get target timezone offset using Intl
    const targetDateStr = now.toLocaleString('en-US', { timeZone: timezone });
    const targetDate = new Date(targetDateStr);

    const utcDateStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const utcDate = new Date(utcDateStr);

    const diffHours = (targetDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const userDiffHours = diffHours - (userOffsetMin / 60);

    if (Math.abs(userDiffHours) < 0.01) {
      return 'Same time';
    }
    const sign = userDiffHours > 0 ? '+' : '';
    const rounded = Math.round(userDiffHours * 10) / 10;
    return `${sign}${rounded} hrs`;
  } catch (e) {
    return '';
  }
}
