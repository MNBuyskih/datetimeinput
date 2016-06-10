interface JQuery {
    datetime(model:Date):JQuery;
    datetimeInputFitWidth(length:number, correction?:number):JQuery;
}

$.fn.datetime = function (model:Date) {
    return new DateTime($(this)[0], model);
};
$.fn.datetimeInputFitWidth = function (length:number, correction?:number) {
    $.each(this, (n, el) => new DatetimeInputFitWidth(el, length, correction));
};

const KEY_CODES = {_0:48,_1:49,_2:50,_3:51,_4:52,_5:53,_6:54,_7:55,_8:56,_9:57,BACKSPACE:8,TAB:9,ENTER:13,SHIFT:16,CTRL:17,ALT:18,PAUSE_BREAK:19,CAPSLOCK:20,ESCAPE:27,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,INSERT:45,DELETE:46,A:65,B:66,C:67,D:68,E:69,F:70,G:71,H:72,I:73,J:74,K:75,L:76,M:77,N:78,O:79,P:80,Q:81,R:82,S:83,T:84,U:85,V:86,W:87,X:88,Y:89,Z:90,LEFT_WINDOW:91,RIGHT_WINDOW:92,SELECT_KEY:93,NUMPAD0:96,NUMPAD1:97,NUMPAD2:98,NUMPAD3:99,NUMPAD4:100,NUMPAD5:101,NUMPAD6:102,NUMPAD7:103,NUMPAD8:104,NUMPAD9:105,MULTIPLY:106,ADD:107,SUBTRACT:109,DECIMAL:110,DIVIDE:111,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,NUMLOCK:144,SCROLLLOCK:145,SEMI_COLON:186,EQUAL_SIGN:187,COMMA:188,DASH:189,PERIOD:190,FORWARD_SLASH:191,GRAVE_ACCENT:192,OPEN_BRACKET:219,BACKSLASH:220,CLOSE_BRAKET:221,SINGLE_QUOTE:222};

class DateTime {
    private $element:JQuery;
    private $wrap:JQuery;
    private dayInput:DateTimeInput;
    private monthInput:DateTimeInput;
    private yearInput:DateTimeInput;
    private hoursInput:DateTimeInput;
    private minutesInput:DateTimeInput;
    event = new EventGen();

    constructor(private element:HTMLElement, public model:Date) {
        this.$element = $(this.element);
        this.$element.data('dateTime', this);
        this.$element.data('dateTimeValue', model);

        this.init();
        this.setValue(this.model);
    }

    init() {
        this.$wrap = $('<div class="datetime-wrapper">' +
            '<input class="datetime-input" type="text" data-model="day" size="2" maxlength="2" placeholder="дд">' +
            '<span class="datetime-separator">.</span>' +
            '<input class="datetime-input" type="text" data-model="month" size="2" maxlength="2" placeholder="мм">' +
            '<span class="datetime-separator">.</span>' +
            '<input class="datetime-input" type="text" data-model="year" size="4" maxlength="4" placeholder="гггг">' +
            '<span class="datetime-separator">&nbsp;</span>' +
            '<input class="datetime-input" type="text" data-model="hours" size="2" maxlength="2" placeholder="чч">' +
            '<span class="datetime-separator">:</span>' +
            '<input class="datetime-input" type="text" data-model="minutes" size="2" maxlength="2" placeholder="мм">' +
            '</div>');
        this.$element.after(this.$wrap);
        this.$wrap.css(this.$element.css(['font', 'border', 'border-radius', 'padding', 'margin', 'line-height', 'color', 'display', 'background']));
        this.$wrap.find('input').css(this.$element.css(['line-height', 'font', 'color']));
        this.$wrap.find('input[size=2]').datetimeInputFitWidth(2, 2);
        this.$wrap.find('input[size=4]').datetimeInputFitWidth(4);

        this.$element.hide();

        this.dayInput = new DateTimeInput(this.$wrap.find('input[data-model="day"]'), 31, 0, () => DatetimeLastDayOfMonth(this.model.getMonth()));
        this.dayInput.event.on('change', (value:number, next:boolean) => {
            value = Math.min(value, DatetimeLastDayOfMonth(this.model.getMonth()));
            this.dayInput.buffer.viewValue = value.toString();
            if (value > 0) this.model.setDate(value) && this.event.trigger('change', this.model);
            if (next && value > 3) this.monthInput.focus();
        });
        this.dayInput.event.on('next', () => this.monthInput.focus());

        this.monthInput = new DateTimeInput(this.$wrap.find('input[data-model="month"]'), 12, 1);
        this.monthInput.event.on('change', (value:number, next:boolean) => {
            value = Math.min(value, 12);
            this.dayInput.setValue(Math.min(this.model.getDate(), DatetimeLastDayOfMonth(value)));
            this.model.setMonth(value);
            this.event.trigger('change', this.model);
            if (next && value > 1) this.yearInput.focus();
        });
        this.monthInput.event.on('prev', () => this.dayInput.focus());
        this.monthInput.event.on('next', () => this.yearInput.focus());

        this.yearInput = new DateTimeInput(this.$wrap.find('input[data-model="year"]'), 9999);
        this.yearInput.event.on('change', (value:number, next:boolean) => {
            value = Math.min(value, 9999);
            this.model.setFullYear(value);
            this.event.trigger('change', this.model);
            if (next && value.toString().length > 3) this.hoursInput.focus();
        });
        this.yearInput.event.on('prev', () => this.monthInput.focus());
        this.yearInput.event.on('next', () => this.hoursInput.focus());

        this.hoursInput = new DateTimeInput(this.$wrap.find('input[data-model="hours"]'), 23);
        this.hoursInput.event.on('change', (value:number, next:boolean) => {
            value = Math.min(value, 23);
            this.model.setHours(value);
            this.event.trigger('change', this.model);
            if (next && value > 2) this.minutesInput.focus();
        });
        this.hoursInput.event.on('prev', () => this.yearInput.focus());
        this.hoursInput.event.on('next', () => this.minutesInput.focus());

        this.minutesInput = new DateTimeInput(this.$wrap.find('input[data-model="minutes"]'), 59);
        this.minutesInput.event.on('change', (value:number, next:boolean) => {
            value = Math.min(value, 59);
            this.model.setMinutes(value);
            this.event.trigger('change', this.model);
            if (next && value > 5) {
                this.hoursInput.focus();
                this.minutesInput.focus();
            }
        });
        this.minutesInput.event.on('prev', () => this.hoursInput.focus());
    }

    setValue(date:Date) {
        this.dayInput.setValue(date.getDate(), false);
        this.monthInput.setValue(date.getMonth(), false);
        this.yearInput.setValue(date.getFullYear(), false);
        this.hoursInput.setValue(date.getHours(), false);
        this.minutesInput.setValue(date.getMinutes(), false);
    }
}

class DateTimeInput {
    buffer:DateTimeBuffer;
    bufferSpan:JQuery;
    event = new EventGen();
    private _max:number;
    private maxGetter:Function;
    private _inputLength:number;

    constructor(private input:JQuery, max:number, private viewCorrection:number = 0, maxGetter?:Function) {
        this._max = max;
        this.maxGetter = maxGetter;
        this.buffer = new DateTimeBuffer(this.max.toString().length);
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
                this.input.val(DatetimeInputPadLeft(this.input.val(), this.max.toString().length));
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

class DateTimeBuffer {
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

class EventGen implements IEventGen {
    private _events:IEventStorage[] = [];

    trigger(eventName:string, ...params):IEventGen {
        this._events
            .filter((e) => e.eventName == eventName)
            .forEach((e) => e.method.apply(e.thisArg, params));

        return this;
    }

    on(eventName:string, method:Function, thisArg?:any):IEventGen {
        this._events.push({eventName, method, thisArg});

        return this;
    }
}

interface IEventGen {
    trigger(eventName:string, ...params);
    on(eventName:string, method:Function, thisArg?:any);
}

interface IEventStorage {
    eventName:string;
    method:Function;
    thisArg?:any;
}

interface IDateTimeEvent {
    __events:any;
    _on(eventName:string, cb:Function):void;
    _trigger(eventName:string, ...params:any[]):void;
}

function DatetimeLastDayOfMonth(month:number, year?:number):number {
    year = year || new Date().getFullYear();
    return new Date(year, month + 1, 0).getDate();
}
function DatetimeInputStrRepeat(string:string, times:number) {
    return new Array(times + 1).join(string);
}
function DatetimeInputPadLeft(string:string, maxLength:number, symbol:string = '0') {
    return DatetimeInputStrRepeat(symbol, Math.max(0, maxLength - string.length)) + string;
}
