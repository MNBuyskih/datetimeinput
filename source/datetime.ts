interface JQuery {
    datetime(model:Date):JQuery;
    datetimeInputFitWidth(length:number, correction?:number):JQuery;
}

$.fn.datetime = function (model:Date) {
    $.each(this, (n, el) => new DateTime(el, model));
};
$.fn.datetimeInputFitWidth = function (length:number, correction?:number) {
    $.each(this, (n, el) => new DatetimeInputFitWidth(el, length, correction));
};

class DateTime {
    private $element:JQuery;
    private $wrap:JQuery;
    private dayInput:DateTimeInput;
    private monthInput:DateTimeInput;
    private yearInput:DateTimeInput;
    private hoursInput:DateTimeInput;
    private minutesInput:DateTimeInput;

    constructor(private element:HTMLElement, public model:Date) {
        this.$element = $(this.element);
        this.$element.data('dateTime', this);
        this.$element.data('dateTimeValue', model);

        this.init();
        this.setValue(this.model);
    }

    init() {
        this.$wrap = $('<div class="datetime-wrapper">' +
            '<input class="datetime-input" type="text" data-model="day" size="2" placeholder="дд">' +
            '<span class="datetime-separator">.</span>' +
            '<input class="datetime-input" type="text" data-model="month" size="2" placeholder="мм">' +
            '<span class="datetime-separator">.</span>' +
            '<input class="datetime-input" type="text" data-model="year" size="4" placeholder="гггг">' +
            '<span class="datetime-separator">&nbsp;</span>' +
            '<input class="datetime-input" type="text" data-model="hours" size="2" placeholder="чч">' +
            '<span class="datetime-separator">:</span>' +
            '<input class="datetime-input" type="text" data-model="minutes" size="2" placeholder="мм">' +
            '</div>');
        this.$element.after(this.$wrap);
        this.$wrap.css(this.$element.css(['font', 'border', 'border-radius', 'padding', 'margin', 'line-height', 'color', 'display']));
        this.$wrap.find('input').css(this.$element.css(['line-height', 'font', 'color']));
        this.$wrap.find('input[size=2]').datetimeInputFitWidth(2, 2);
        this.$wrap.find('input[size=4]').datetimeInputFitWidth(4);

        this.$element.hide();

        this.dayInput = new DateTimeInput(this.$wrap.find('input[data-model="day"]'), 31);
        this.dayInput.on('change', (value:number, next:boolean) => {
            if (value > 0) this.model.setDate(value);
            if (next && value > 3) this.monthInput.focus();
        });
        this.dayInput.on('next', () => this.monthInput.focus());

        this.monthInput = new DateTimeInput(this.$wrap.find('input[data-model="month"]'), 12, 1);
        this.monthInput.on('change', (value:number, next:boolean) => {
            this.model.setMonth(value);
            if (next && value > 1) this.yearInput.focus();
        });
        this.monthInput.on('prev', () => this.dayInput.focus());
        this.monthInput.on('next', () => this.yearInput.focus());

        this.yearInput = new DateTimeInput(this.$wrap.find('input[data-model="year"]'), 9999);
        this.yearInput.on('change', (value:number, next:boolean) => {
            this.model.setFullYear(value);
            if (next && value.toString().length > 3) this.hoursInput.focus();
        });
        this.yearInput.on('prev', () => this.monthInput.focus());
        this.yearInput.on('next', () => this.hoursInput.focus());

        this.hoursInput = new DateTimeInput(this.$wrap.find('input[data-model="hours"]'), 23);
        this.hoursInput.on('change', (value:number, next:boolean) => {
            this.model.setHours(value);
            if (next && value > 2) this.minutesInput.focus();
        });
        this.hoursInput.on('prev', () => this.yearInput.focus());
        this.hoursInput.on('next', () => this.minutesInput.focus());

        this.minutesInput = new DateTimeInput(this.$wrap.find('input[data-model="minutes"]'), 59);
        this.minutesInput.on('change', (value:number, next:boolean) => {
            this.model.setMinutes(value);
            if (next && value > 5) {
                this.hoursInput.focus();
                this.minutesInput.focus();
            }
        });
        this.minutesInput.on('prev', () => this.hoursInput.focus());
    }

    setValue(date:Date) {
        this.dayInput.setValue(date.getDate(), false);
        this.monthInput.setValue(date.getMonth(), false);
        this.yearInput.setValue(date.getFullYear(), false);
        this.hoursInput.setValue(date.getHours(), false);
        this.minutesInput.setValue(date.getMinutes(), false);
    }
}

class DateTimeInput implements IDateTimeEvent {
    buffer:DateTimeBuffer = new DateTimeBuffer(this.max.toString().length);
    bufferSpan:JQuery;
    _events:any = {};

    constructor(private input:JQuery, private max:number, private viewCorrection:number = 0) {
        this.toggleEmptyInput();
        this.input
            .on('keydown', (e) => {
                switch (e.keyCode) {
                    case 37: // left arrow
                        e.preventDefault();
                        this.trigger('prev');
                        break;
                    case 39: // right arrow
                        e.preventDefault();
                        this.trigger('next');
                        break;
                    case 38: // up arrow
                        e.preventDefault();
                        this.increment();
                        break;
                    case 40: // down arrow
                        e.preventDefault();
                        this.decrement();
                        break;
                    case 8: // backspace
                    case 46: // delete
                        e.preventDefault();
                        this.setValue(0);
                        break;
                    case 9: // tab
                        break;

                    default:
                        // F1-12 and numbers only
                        if (!(!e.ctrlKey && e.keyCode >= 112 && e.keyCode <= 123)
                            && !(e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57)) return e.preventDefault();
                        break;
                }
            })
            .on('input', () => {
                this.toggleEmptyInput();
                this.fillBuffer();
                this.triggerChange();
            })
            .on('click', () => this.selectAll())
            .on('focus', () => {
                this.buffer.viewValue = this.input.val();
                this.bufferSpan.html(this.buffer.viewValue);
                this.selectAll();
            })
            .on('blur', () => {
                this.input.val(DatetimeInputPadLeft(this.input.val(), this.max.toString().length));
                this.buffer.reset();
            });

        this.buffer.on('change', () => this.bufferSpan.html(this.buffer.viewValue));
        this.createBufferSpan();
    }

    on(eventName:string, cb:Function):void {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName].push(cb);
    }

    trigger(eventName:string, ...params):void {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName] && this._events[eventName].forEach((cb) => cb.apply(null, params));
    }

    increment(increment:number = 1) {
        let val = this.buffer.numberValue || parseInt(this.input.val()) || 0;

        val += increment;
        if (val > this.max) val = 1;
        if (val < 1) val = this.max;

        this.setValue(val, false);
    }

    decrement(decrement:number = -1) {
        this.increment(decrement);
    }

    setValue(val:number, next:boolean = true) {
        val += this.viewCorrection;
        var string = val.toString();
        this.input.val(DatetimeInputPadLeft(string, this.max.toString().length));
        this.buffer.setValue(string);
        this.triggerChange(next);
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
        this.buffer.addLastCharFromString(this.input.val());
    }

    private triggerChange(next:boolean = true) {
        var number = this.buffer.numberValue;
        if (!isNaN(number)) {
            number -= this.viewCorrection;
            if (number < 1) this.input.val(this.buffer.numberValue = 1);
            if (number > this.max) this.input.val(this.buffer.numberValue = this.max);
            this.trigger('change', number, next);
        }
    }

    private selectAll() {
        this.input.get(0)['select']();
    }
}

class DateTimeBuffer implements IDateTimeEvent {
    private _buffer:string = '';
    private _viewValue:string;
    _events:any = {};
    maxLength:number;

    constructor(maxLength:number) {
        this.maxLength = maxLength;
    }

    on(eventName:string, cb:Function):void {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName].push(cb);
    }

    trigger(eventName:string, ...params):void {
        if (!this._events[eventName]) this._events[eventName] = [];
        this._events[eventName] && this._events[eventName].forEach((cb) => cb.apply(null, params));
    }

    get buffer():string {
        return this._buffer;
    }

    set buffer(value:string) {
        this._viewValue = '';
        this._buffer = value;
        this.trigger('change');
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

class DatetimeInputFitWidth {
    private $element:JQuery;

    constructor(private element:HTMLElement, private length:number, correction:number = 0) {
        this.$element = $(this.element);
        this.$element.width(this.getWidthSpan() + correction);
    }

    getWidthSpan() {
        let span = $('<span>' + DatetimeInputStrRepeat('0', this.length) + '</span>');
        span.css(this.$element.css(['font', 'padding', 'line-height']));
        $('body').append(span);
        let width = span.outerWidth();
        span.remove();
        return width;
    }
}

interface IDateTimeEvent {
    _events:any;
    on(eventName:string, cb:Function):void;
    trigger(eventName:string, ...params:any[]):void;
}

function DatetimeInputStrRepeat(string:string, times:number) {
    return new Array(times + 1).join(string);
}
function DatetimeInputPadLeft(string:string, maxLength:number, symbol:string = '0') {
    return DatetimeInputStrRepeat(symbol, Math.max(0, maxLength - string.length)) + string;
}
