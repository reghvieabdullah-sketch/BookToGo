// Utility functions for time and date formatting

export function isWeekend(day: Date): boolean {
    const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
}

export function HHMMToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToHHMM(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function to12HourFormat(time24: string): string {
    // let [hour, minute] = time24.split(':').map(Number);
    // const ampm = hour >= 12 ? 'PM' : 'AM';
    // hour = hour % 12 || 12;
    // return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    return time24;
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "long", // e.g. Tuesday
        month: "short",  // e.g. Oct
        day: "numeric",  // e.g. 1
    });
}


export function to24HourFormat(time12: string): string {
    let [time, modifier] = time12.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (modifier.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
    } else if (modifier.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
