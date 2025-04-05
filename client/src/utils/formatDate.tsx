export default function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const monthNames: string[] = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];

    const day: number = date.getDate();
    const month: string = monthNames[date.getMonth()];
    const year: number = date.getFullYear();

    const suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                   (day === 2 || day === 22) ? 'nd' :
                   (day === 3 || day === 23) ? 'rd' : 'th';

    return `${month} ${day}${suffix} ${year}`;
  }
