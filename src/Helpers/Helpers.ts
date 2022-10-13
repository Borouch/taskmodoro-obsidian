import type { Duration, Moment } from 'moment';
import { TaskStatus } from '../Enums/TaskStatus';

export const  statusStringToEnumMapper = (status: string): TaskStatus => {
    //   public StringOfEnum(enum,value)
    // {
    //   for (var k in enum) if (enum[k] == value) return k;
    //   return null;
    // }
    switch (status) {
      case 'uncompleted':
        return TaskStatus.Uncompleted;
      case 'done':
        return TaskStatus.Done;
      case 'failed':
        return TaskStatus.Failed;
      default:
        return TaskStatus.Uncompleted;
    }
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
