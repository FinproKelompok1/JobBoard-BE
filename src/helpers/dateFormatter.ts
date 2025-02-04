export function dateFormatter(age: number, currentDate: Date) {
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  return `${age}-${month}-${day}T00:00:00Z`;
}