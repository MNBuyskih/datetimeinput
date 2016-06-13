module Datetime {
    export class DateTimeBuffer {
        private _buffer:string = '';
        private _viewValue:string;
        event = new EventGen();
        maxLength:number;

        constructor(maxLength:number) {
            this.maxLength = maxLength;
        }

        get buffer():string {
            return this._buffer;
        }

        set buffer(value:string) {
            this._viewValue = '';
            this._buffer = value;
            this.event.trigger('change');
        }

        get viewValue() {
            if (this._viewValue) return this._viewValue;
            if (!this._buffer) return this._buffer;
            return DatetimeInputPadLeft(this._buffer, this.maxLength);
        }

        set viewValue(value:string) {
            this._viewValue = value;
        }

        get numberValue():number {
            return parseFloat(this._buffer);
        }

        addLastCharFromString(string) {
            if (!string) this.buffer = '';
            this.buffer += string.slice(-1);
        }

        reset() {
            this._viewValue = '';
            this.buffer = '';
        }

        setValue(value:string) {
            this.buffer = value;
        }
    }
}