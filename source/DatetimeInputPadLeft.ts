module Datetime {
    export function DatetimeInputPadLeft(string:string, maxLength:number, symbol:string = '0') {
        return DatetimeInputStrRepeat(symbol, Math.max(0, maxLength - string.length)) + string;
    }
}