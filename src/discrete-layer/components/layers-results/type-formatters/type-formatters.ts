
import moment from 'moment';
import CONFIG from '../../../../common/config';

export interface FormatterFunc {
  (source: string | Date | undefined): string;
}

export const stringFormatter: FormatterFunc = (val): string =>
  val !== undefined ? val.toString() : '';
export const dateFormatter: FormatterFunc = (date): string => {
  // eslint-disable-next-line
  return date !== undefined && 'toISOString' in (date as any)
    ? moment(date).format(CONFIG.LOCALE.DATE_TIME_FORMAT)
    : '-';
};
