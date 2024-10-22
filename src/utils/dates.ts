export function subtractSecondsFromNow(seconds: number): Date {
  const now = new Date();
  const newTime = new Date(now.getTime() - seconds * 1000);
  return newTime;
}

export function subtractMinutesFromNow(minutes: number): Date {
  return subtractSecondsFromNow(minutes * 60);
}
