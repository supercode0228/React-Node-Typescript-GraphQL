// Ref: https://stackoverflow.com/a/8619946
export const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
};

// Ref: https://stackoverflow.com/a/1184359
export const daysInMonth = (month : number, year : number) => {
  return new Date(year, month, 0).getDate();
}

export interface ContractedTime {
  value : number;
  unit : ('day' | 'week' | 'month');
};

export const contractTime = (time : number) : ContractedTime => {
  const day = 86000000;
  const week = 7 * day;
  const month = 30 * day;
  
  if(Math.abs(time) < 2 * week) {
    return { value: Math.round(time / day), unit: 'day' };
  } else if(Math.abs(time) < 8 * week) {
    return { value: Math.round(time / week), unit: 'week' };
  }
  return { value: Math.round(time / month), unit: 'month' };
}
