const sameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatClock = (date: Date) =>
  `${date.getHours()}h${String(date.getMinutes()).padStart(2, '0')}`;

export function formatHistoryTime(createdAt: number, now = Date.now()): string {
  const date = new Date(createdAt);
  const current = new Date(now);
  const diffMinutes = Math.floor((now - createdAt) / 60_000);

  if (diffMinutes < 1) {
    return "À l'instant";
  }
  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);

  if (sameDay(date, current)) {
    return `Aujourd'hui ${formatClock(date)}`;
  }
  if (sameDay(date, yesterday)) {
    return `Hier ${formatClock(date)}`;
  }

  const diffDays = Math.floor((now - createdAt) / 86_400_000);
  if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  }

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
