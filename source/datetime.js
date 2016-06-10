$.fn.datetime = function (model) {
    return new DateTime($(this)[0], model);
};
$.fn.datetimeInputFitWidth = function (length, correction) {
    $.each(this, function (n, el) { return new DatetimeInputFitWidth(el, length, correction); });
};
var KEY_CODES = { _0: 48, _1: 49, _2: 50, _3: 51, _4: 52, _5: 53, _6: 54, _7: 55, _8: 56, _9: 57, BACKSPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE_BREAK: 19, CAPSLOCK: 20, ESCAPE: 27, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT_ARROW: 37, UP_ARROW: 38, RIGHT_ARROW: 39, DOWN_ARROW: 40, INSERT: 45, DELETE: 46, A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90, LEFT_WINDOW: 91, RIGHT_WINDOW: 92, SELECT_KEY: 93, NUMPAD0: 96, NUMPAD1: 97, NUMPAD2: 98, NUMPAD3: 99, NUMPAD4: 100, NUMPAD5: 101, NUMPAD6: 102, NUMPAD7: 103, NUMPAD8: 104, NUMPAD9: 105, MULTIPLY: 106, ADD: 107, SUBTRACT: 109, DECIMAL: 110, DIVIDE: 111, F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123, NUMLOCK: 144, SCROLLLOCK: 145, SEMI_COLON: 186, EQUAL_SIGN: 187, COMMA: 188, DASH: 189, PERIOD: 190, FORWARD_SLASH: 191, GRAVE_ACCENT: 192, OPEN_BRACKET: 219, BACKSLASH: 220, CLOSE_BRAKET: 221, SINGLE_QUOTE: 222 };
var DateTime = (function () {
    function DateTime(element, model) {
        this.element = element;
        this.model = model;
        this.event = new EventGen();
        this.$element = $(this.element);
        this.$element.data('dateTime', this);
        this.$element.data('dateTimeValue', model);
        this.init();
        this.setValue(this.model);
    }
    DateTime.prototype.init = function () {
        var _this = this;
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
        this.dayInput = new DateTimeInput(this.$wrap.find('input[data-model="day"]'), 31, 0, function () { return DatetimeLastDayOfMonth(_this.model.getMonth()); });
        this.dayInput.event.on('change', function (value, next) {
            value = Math.min(value, DatetimeLastDayOfMonth(_this.model.getMonth()));
            _this.dayInput.buffer.viewValue = value.toString();
            if (value > 0)
                _this.model.setDate(value) && _this.event.trigger('change', _this.model);
            if (next && value > 3)
                _this.monthInput.focus();
        });
        this.dayInput.event.on('next', function () { return _this.monthInput.focus(); });
        this.monthInput = new DateTimeInput(this.$wrap.find('input[data-model="month"]'), 12, 1);
        this.monthInput.event.on('change', function (value, next) {
            value = Math.min(value, 12);
            _this.dayInput.setValue(Math.min(_this.model.getDate(), DatetimeLastDayOfMonth(value)));
            _this.model.setMonth(value);
            _this.event.trigger('change', _this.model);
            if (next && value > 1)
                _this.yearInput.focus();
        });
        this.monthInput.event.on('prev', function () { return _this.dayInput.focus(); });
        this.monthInput.event.on('next', function () { return _this.yearInput.focus(); });
        this.yearInput = new DateTimeInput(this.$wrap.find('input[data-model="year"]'), 9999);
        this.yearInput.event.on('change', function (value, next) {
            value = Math.min(value, 9999);
            _this.model.setFullYear(value);
            _this.event.trigger('change', _this.model);
            if (next && value.toString().length > 3)
                _this.hoursInput.focus();
        });
        this.yearInput.event.on('prev', function () { return _this.monthInput.focus(); });
        this.yearInput.event.on('next', function () { return _this.hoursInput.focus(); });
        this.hoursInput = new DateTimeInput(this.$wrap.find('input[data-model="hours"]'), 23);
        this.hoursInput.event.on('change', function (value, next) {
            value = Math.min(value, 23);
            _this.model.setHours(value);
            _this.event.trigger('change', _this.model);
            if (next && value > 2)
                _this.minutesInput.focus();
        });
        this.hoursInput.event.on('prev', function () { return _this.yearInput.focus(); });
        this.hoursInput.event.on('next', function () { return _this.minutesInput.focus(); });
        this.minutesInput = new DateTimeInput(this.$wrap.find('input[data-model="minutes"]'), 59);
        this.minutesInput.event.on('change', function (value, next) {
            value = Math.min(value, 59);
            _this.model.setMinutes(value);
            _this.event.trigger('change', _this.model);
            if (next && value > 5) {
                _this.hoursInput.focus();
                _this.minutesInput.focus();
            }
        });
        this.minutesInput.event.on('prev', function () { return _this.hoursInput.focus(); });
    };
    DateTime.prototype.setValue = function (date) {
        this.dayInput.setValue(date.getDate(), false);
        this.monthInput.setValue(date.getMonth(), false);
        this.yearInput.setValue(date.getFullYear(), false);
        this.hoursInput.setValue(date.getHours(), false);
        this.minutesInput.setValue(date.getMinutes(), false);
    };
    return DateTime;
}());
var DateTimeInput = (function () {
    function DateTimeInput(input, max, viewCorrection, maxGetter) {
        var _this = this;
        if (viewCorrection === void 0) { viewCorrection = 0; }
        this.input = input;
        this.viewCorrection = viewCorrection;
        this.event = new EventGen();
        this._max = max;
        this.maxGetter = maxGetter;
        this.buffer = new DateTimeBuffer(this.max.toString().length);
        this.toggleEmptyInput();
        this.input
            .on('keydown', function (e) {
            switch (e.keyCode) {
                case KEY_CODES.LEFT_ARROW:
                    e.preventDefault();
                    _this.event.trigger('prev');
                    break;
                case KEY_CODES.RIGHT_ARROW:
                    e.preventDefault();
                    _this.event.trigger('next');
                    break;
                case KEY_CODES.UP_ARROW:
                    e.preventDefault();
                    _this.increment();
                    break;
                case KEY_CODES.DOWN_ARROW:
                    e.preventDefault();
                    _this.decrement();
                    break;
                case KEY_CODES.BACKSPACE: // backspace
                case KEY_CODES.DELETE:
                    e.preventDefault();
                    _this.setValue(0);
                    _this.buffer.reset();
                    _this.selectAll();
                    break;
                case KEY_CODES.TAB:
                    break;
                default:
                    // F1-12 and numbers only
                    if (!(!e.ctrlKey && e.keyCode >= KEY_CODES.F1 && e.keyCode <= KEY_CODES.F12)
                        && !(e.keyCode >= KEY_CODES.NUMPAD0 && e.keyCode <= KEY_CODES.NUMPAD9 || e.keyCode >= KEY_CODES._0 && e.keyCode <= KEY_CODES._9))
                        return e.preventDefault();
                    break;
            }
        })
            .on('input', function () {
            _this.toggleEmptyInput();
            _this._inputLength += 1;
            _this.fillBuffer();
            _this.triggerChange();
        })
            .on('click', function () { return _this.selectAll(); })
            .on('focus', function () {
            _this.bufferSpan.html(_this.buffer.viewValue = _this.input.val());
            _this.selectAll();
        })
            .on('blur', function () {
            _this.input.val(DatetimeInputPadLeft(_this.input.val(), _this.max.toString().length));
            _this._inputLength = 0;
            _this.buffer.reset();
        });
        this.buffer.event.on('change', function () { return _this.bufferSpan.html(_this.buffer.viewValue); });
        this.createBufferSpan();
    }
    Object.defineProperty(DateTimeInput.prototype, "max", {
        get: function () {
            if (this.maxGetter)
                return this.maxGetter();
            return this._max;
        },
        set: function (value) {
            this._max = value;
        },
        enumerable: true,
        configurable: true
    });
    DateTimeInput.prototype.increment = function (increment) {
        if (increment === void 0) { increment = 1; }
        var val = this.buffer.numberValue || parseInt(this.input.val()) || 0;
        val += increment;
        if (val > this.max)
            val = 1;
        if (val < 1)
            val = this.max;
        this.setValue(val - this.viewCorrection, false);
    };
    DateTimeInput.prototype.decrement = function (decrement) {
        if (decrement === void 0) { decrement = -1; }
        this.increment(decrement);
    };
    DateTimeInput.prototype.setValue = function (val, next) {
        if (next === void 0) { next = true; }
        val += this.viewCorrection;
        var string = val.toString();
        this.input.val(DatetimeInputPadLeft(string, this.max.toString().length));
        this.buffer.setValue(string);
        this.triggerChange(next);
    };
    DateTimeInput.prototype.focus = function () {
        this.input.focus();
    };
    DateTimeInput.prototype.createBufferSpan = function () {
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
    };
    DateTimeInput.prototype.toggleEmptyInput = function () {
        this.input.toggleClass('empty', !this.input.val().length);
    };
    DateTimeInput.prototype.fillBuffer = function () {
        if (this._inputLength)
            this.buffer.addLastCharFromString(this.input.val());
        else
            this.buffer.setValue(this.input.val());
    };
    DateTimeInput.prototype.triggerChange = function (next) {
        if (next === void 0) { next = true; }
        var number = this.buffer.numberValue;
        if (!isNaN(number) && number !== 0) {
            var max = this.max;
            number -= this.viewCorrection;
            if (number > max)
                this.input.val(this.buffer.numberValue = number = max);
            this.event.trigger('change', number, next);
        }
    };
    DateTimeInput.prototype.selectAll = function () {
        this.input.get(0)['select']();
    };
    return DateTimeInput;
}());
var DateTimeBuffer = (function () {
    function DateTimeBuffer(maxLength) {
        this._buffer = '';
        this.event = new EventGen();
        this.maxLength = maxLength;
    }
    Object.defineProperty(DateTimeBuffer.prototype, "buffer", {
        get: function () {
            return this._buffer;
        },
        set: function (value) {
            this._viewValue = '';
            this._buffer = value;
            this.event.trigger('change');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateTimeBuffer.prototype, "viewValue", {
        get: function () {
            if (this._viewValue)
                return this._viewValue;
            if (!this._buffer)
                return this._buffer;
            return DatetimeInputPadLeft(this._buffer, this.maxLength);
        },
        set: function (value) {
            this._viewValue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DateTimeBuffer.prototype, "numberValue", {
        get: function () {
            return parseFloat(this._buffer);
        },
        enumerable: true,
        configurable: true
    });
    DateTimeBuffer.prototype.addLastCharFromString = function (string) {
        if (!string)
            this.buffer = '';
        this.buffer += string.slice(-1);
    };
    DateTimeBuffer.prototype.reset = function () {
        this._viewValue = '';
        this.buffer = '';
    };
    DateTimeBuffer.prototype.setValue = function (value) {
        this.buffer = value;
    };
    return DateTimeBuffer;
}());
var DatetimeInputFitWidth = (function () {
    function DatetimeInputFitWidth(element, length, correction) {
        if (correction === void 0) { correction = 0; }
        this.element = element;
        this.length = length;
        this.$element = $(this.element);
        this.$element.width(this.getWidthSpan() + correction);
    }
    DatetimeInputFitWidth.prototype.getWidthSpan = function () {
        var span = $('<span>' + DatetimeInputStrRepeat('0', this.length) + '</span>');
        span.css(this.$element.css(['font', 'padding', 'line-height']));
        $('body').append(span);
        var width = span.outerWidth();
        span.remove();
        return width;
    };
    return DatetimeInputFitWidth;
}());
var EventGen = (function () {
    function EventGen() {
        this._events = [];
    }
    EventGen.prototype.trigger = function (eventName) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        this._events
            .filter(function (e) { return e.eventName == eventName; })
            .forEach(function (e) { return e.method.apply(e.thisArg, params); });
        return this;
    };
    EventGen.prototype.on = function (eventName, method, thisArg) {
        this._events.push({ eventName: eventName, method: method, thisArg: thisArg });
        return this;
    };
    return EventGen;
}());
function DatetimeLastDayOfMonth(month, year) {
    year = year || new Date().getFullYear();
    return new Date(year, month + 1, 0).getDate();
}
function DatetimeInputStrRepeat(string, times) {
    return new Array(times + 1).join(string);
}
function DatetimeInputPadLeft(string, maxLength, symbol) {
    if (symbol === void 0) { symbol = '0'; }
    return DatetimeInputStrRepeat(symbol, Math.max(0, maxLength - string.length)) + string;
}
//# sourceMappingURL=datetime.js.map