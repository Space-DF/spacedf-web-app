import dayjs from 'dayjs'

export enum TimeFormat {
  FULL_DATE_TIME = 'MMMM D, YYYY [at] h:mm A [GMT]Z',
  FULL_DATE_TIME_WITH_SECONDS = 'MMMM D, YYYY [at] h:mm:ss A [GMT]Z',
  SHORT_DATE_TIME = 'MMM D, YYYY, h:mm A',
  SHORT_DATE_TIME_WITH_SECONDS = 'MMM D, YYYY, h:mm:ss A',
  SHORT_DATE_TIME_WITH_DAY = 'ddd, MMM D, YYYY, h:mm A',
  NUMERIC_DATE_TIME = 'M/D/YYYY, h:mm A',
  NUMERIC_DATE_TIME_WITH_SECONDS = 'M/D/YYYY, h:mm:ss A',
  LONG_DATE = 'MMMM D, YYYY',
  SHORT_DATE = 'MMM D, YYYY',
  DAY_DATE = 'ddd, MMM D, YYYY',
  NUMERIC_DATE = 'M/D/YYYY',
  TIME_24H = 'HH:mm',
  TIME_24H_WITH_SECONDS = 'HH:mm:ss',
  TIME_12H_WITH_SECONDS = 'h:mm:ss A',
  TIME_12H = 'h:mm A',
  FULL_DATE_MONTH_YEAR = 'DD/MM/YYYY',
  FULL_MONTH_DATE_YEAR = 'MM/DD/YYYY',
  FULL_YEAR_MONTH_DATE = 'YYYY/MM/DD',
  FULL_YEAR_DATE_MONTH = 'YYYY/DD/MM',
  FULL_DATE_WITH_ORDINAL = 'MMMM D, YYYY',
}

const currentDate = dayjs(new Date())

export const DATE_FORMAT = [
  {
    label: currentDate.format(TimeFormat.FULL_DATE_MONTH_YEAR),
    value: TimeFormat.FULL_DATE_MONTH_YEAR,
  },
  {
    label: currentDate.format(TimeFormat.FULL_MONTH_DATE_YEAR),
    value: TimeFormat.FULL_MONTH_DATE_YEAR,
  },
  {
    label: currentDate.format(TimeFormat.FULL_YEAR_MONTH_DATE),
    value: TimeFormat.FULL_YEAR_MONTH_DATE,
  },
  {
    label: currentDate.format(TimeFormat.FULL_YEAR_DATE_MONTH),
    value: TimeFormat.FULL_YEAR_DATE_MONTH,
  },
  // {
  //   label: currentDate.format(TimeFormat.FULL_DATE_TIME),
  //   value: TimeFormat.FULL_DATE_TIME,
  // },
  // {
  //   label: currentDate.format(TimeFormat.FULL_DATE_TIME_WITH_SECONDS),
  //   value: TimeFormat.FULL_DATE_TIME_WITH_SECONDS,
  // },
  // {
  //   label: currentDate.format(TimeFormat.SHORT_DATE_TIME),
  //   value: TimeFormat.SHORT_DATE_TIME,
  // },
  // {
  //   label: currentDate.format(TimeFormat.SHORT_DATE_TIME_WITH_SECONDS),
  //   value: TimeFormat.SHORT_DATE_TIME_WITH_SECONDS,
  // },
  // {
  //   label: currentDate.format(TimeFormat.SHORT_DATE_TIME_WITH_DAY),
  //   value: TimeFormat.SHORT_DATE_TIME_WITH_DAY,
  // },
  // {
  //   label: currentDate.format(TimeFormat.NUMERIC_DATE_TIME),
  //   value: TimeFormat.NUMERIC_DATE_TIME,
  // },
  // {
  //   label: currentDate.format(TimeFormat.NUMERIC_DATE_TIME_WITH_SECONDS),
  //   value: TimeFormat.NUMERIC_DATE_TIME_WITH_SECONDS,
  // },
  // {
  //   label: currentDate.format(TimeFormat.LONG_DATE),
  //   value: TimeFormat.LONG_DATE,
  // },
  // {
  //   label: currentDate.format(TimeFormat.SHORT_DATE),
  //   value: TimeFormat.SHORT_DATE,
  // },
  // {
  //   label: currentDate.format(TimeFormat.DAY_DATE),
  //   value: TimeFormat.DAY_DATE,
  // },
  // {
  //   label: currentDate.format(TimeFormat.TIME_24H),
  //   value: TimeFormat.TIME_24H,
  // },
  // {
  //   label: currentDate.format(TimeFormat.TIME_24H_WITH_SECONDS),
  //   value: TimeFormat.TIME_24H_WITH_SECONDS,
  // },
  // {
  //   label: currentDate.format(TimeFormat.TIME_12H),
  //   value: TimeFormat.TIME_12H,
  // },
  // {
  //   label: currentDate.format(TimeFormat.TIME_12H_WITH_SECONDS),
  //   value: TimeFormat.TIME_12H_WITH_SECONDS,
  // },
]
