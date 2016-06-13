module Datetime {
    export function StrRepeat(string:string, times:number) {
        return new Array(times + 1).join(string);
    }
}