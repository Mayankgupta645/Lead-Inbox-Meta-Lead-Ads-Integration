// "Just now", "10 min ago", "3 hr ago", "Yesterday", then a plain date.
export function timeAgo(dateLike, now = Date.now()) {
  const then = new Date(dateLike).getTime();
  if (Number.isNaN(then)) return '';

  const mins = Math.floor((now - then) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
