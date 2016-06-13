module Datetime {
    export function StrPadLeft(string:string, maxLength:number, symbol:string = '0') {
        return StrRepeat(symbol, Math.max(0, maxLength - string.length)) + string;
    }
}