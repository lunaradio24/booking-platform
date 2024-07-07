export function dateTimeTransformer(dateTime: string | Date) {
  let date: string;
  let time: string;

  dateTime = String(dateTime);

  if (dateTime.includes(' ')) {
    [date, time] = dateTime.split(' ');
    date = date.split('-').join('');
    time = time.split(':').join('').slice(0, 4);
  }

  if (dateTime.includes('T')) {
    [date, time] = dateTime.split('T');
    date = date.split('-').join('');
    time = time.split(':').join('').slice(0, 4);
  }

  return { date, time };
}
