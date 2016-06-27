module Datetime {
    export class Input {
        buffer:Buffer;
        bufferSpan:JQuery;
        event = new Event();
        private _max:number;
        private maxGetter:Function;
        private _inputLength:number;

        constructor(private input:JQuery, max:number, private viewCorrection:number = 0, maxGetter?:Function) {
            this._max = max;
            this.maxGetter = maxGetter;
            this.buffer = new Buffer(this.max.toString().length);
            this.toggleEmptyInput();
            this.input
                .on('keydown', (e) => {
                    switch (e.keyCode) {
                        case KEY_CODES.LEFT_ARROW: // left arrow
                            e.preventDefault();
                            this.event.trigger('prev');
                            break;
                        case KEY_CODES.RIGHT_ARROW: // right arrow
                            e.preventDefault();
                            this.event.trigger('next');
                            break;
                        case KEY_CODES.UP_ARROW: // up arrow
                            e.preventDefault();
                            this.increment();
                            break;
                        case KEY_CODES.DOWN_ARROW: // down arrow
                            e.preventDefault();
                            this.decrement();
                            break;
                        case KEY_CODES.BACKSPACE: // backspace
                        case KEY_CODES.DELETE: // delete
                            e.preventDefault();
                            this.setValue(0);
                            this.buffer.reset();
                            this.selectAll();
                            break;
                        case KEY_CODES.TAB: // tab
                            break;

                        default:
                            // F1-12 and numbers only
                            if (!(!e.ctrlKey && e.keyCode >= KEY_CODES.F1 && e.keyCode <= KEY_CODES.F12)
                                && !(e.keyCode >= KEY_CODES.NUMPAD0 && e.keyCode <= KEY_CODES.NUMPAD9 || e.keyCode >= KEY_CODES._0 && e.keyCode <= KEY_CODES._9)) return e.preventDefault();
                            break;
                    }
                })
                .on('input', () => {
                    this.toggleEmptyInput();
                    this._inputLength += 1;
                    this.fillBuffer();
                    this.triggerChange();
                })
                .on('click', () => this.selectAll())
                .on('focus', () => {
                    this.bufferSpan.html(this.buffer.viewValue = this.input.val());
                    this.selectAll();
                })
                .on('blur', () => {
                    this.input.val(StrPadLeft(this.input.val(), this.max.toString().length));
                    this._inputLength = 0;
                    this.buffer.reset();
                });

            this.buffer.event.on('change', () => this.bufferSpan.html(this.buffer.viewValue));
            this.createBufferSpan();
        }

        get max():number {
            if (this.maxGetter) return this.maxGetter();
            return this._max;
        }

        set max(value:number) {
            this._max = value;
        }

        increment(increment:number = 1) {
            let val = this.buffer.numberValue || parseInt(this.input.val()) || 0;

            val += increment;
            if (val > this.max) val = 1;
            if (val < 1) val = this.max;

            this.setValue(val - this.viewCorrection, false);
        }

        decrement(decrement:number = -1) {
            this.increment(decrement);
        }

        setValue(val:number, next:boolean = true) {
            this.setFixedValue(val);
            this.buffer.setValue(val.toString());
            this.triggerChange(next);
        }

        setFixedValue(val:number) {
            val += this.viewCorrection;
            var string = val.toString();
            this.input.val(StrPadLeft(string, this.max.toString().length));
        }

        focus() {
            this.input.focus();
        }

        createBufferSpan() {
            this.bufferSpan = $('<span class="datetime-buffer"></span>');
            this.bufferSpan.css({
                top: this.input.position().top,
                left: this.input.position().left,
                width: this.input.width(),
                height: this.input.height(),
                font: this.input.css('font'),
                'line-height': this.input.css('line-height'),
            });
            this.input.after(this.bufferSpan);
        }

        toggleEmptyInput() {
            this.input.toggleClass('empty', !this.input.val().length);
        }

        fillBuffer() {
            if (this._inputLength) this.buffer.addLastCharFromString(this.input.val());
            else this.buffer.setValue(this.input.val());
        }

        private triggerChange(next:boolean = true) {
            var number = this.buffer.numberValue;
            if (!isNaN(number) && number !== 0) {
                let max = this.max;

                number -= this.viewCorrection;
                if (number > max) this.input.val(this.buffer.numberValue = number = max);
                this.event.trigger('change', number, next);
            }
        }

        private selectAll() {
            this.input.get(0)['select']();
        }
    }
}