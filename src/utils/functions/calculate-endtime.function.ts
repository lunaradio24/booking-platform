export function calculateEndTime(startTime: number, runtime: number): number {
  const runtimeMinutes = runtime % 60;
  const runtimeHour = ((runtime - runtimeMinutes) / 60) * 100;
  const endTime = startTime + runtimeHour + runtimeMinutes;

  return endTime;
}
