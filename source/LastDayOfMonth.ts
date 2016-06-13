module  Datetime {
    export function LastDayOfMonth(month:number, year?:number):number {
        year = year || new Date().getFullYear();
        return new Date(year, month + 1, 0).getDate();
    }
}