import type { Duration, Moment } from 'moment';

export const isClickOutsideTargets = (e: Event, targets: HTMLElement[]) => {
  const clickTarget = e.target as Node;
  
  const isTargetOutside = targets.find((target) =>
    target.contains(clickTarget)
  ) === undefined;

  return isTargetOutside
};

export const formatDate = (date: Moment | null): string => {
  if (!date) return '';
  return date.format('YYYY-MM-DD');
};

export const formatFMDate = (date: Moment): Date => date.endOf('day').toDate();

export const durationFormat = (dur: Duration): string => {
  const hrs = Math.round(
    dur.clone().subtract(dur.minutes(), 'minutes').asHours(),
  );
  const mins = dur.minutes();
  if (hrs > 0) {
    if (mins === 0) {
      return `${hrs}h`;
    }
    return `${hrs}h ${mins}min`;
  }
  return `${mins}min`;
};

export const getTextAbv = (text: string, charCnt: number): string => {
  if (text.length > charCnt) {
    return text.substring(0, charCnt) + '...';
  }
  return text;
};

export const getBase64AsURL = (
  type: string,
  mime: string,
  base64: string,
): string => {
  return `data:${type}/` + mime + ';base64,' + base64;
};

export const playMp3 = (base64MP3: string) => {
  const sound = getBase64AsURL('audio', 'mp3', base64MP3);
  const audio = new Audio(sound);
  audio.play();
};
