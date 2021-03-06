$.fn.datetime = function (model) {
    return new DateTime($(this)[0], model);
};
$.fn.datetimeInputFitWidth = function (length, correction) {
    $.each(this, function (n, el) { return new DatetimeInputFitWidth(el, length, correction); });
};
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
                case 37:
                    e.preventDefault();
                    _this.event.trigger('prev');
                    break;
                case 39:
                    e.preventDefault();
                    _this.event.trigger('next');
                    break;
                case 38:
                    e.preventDefault();
                    _this.increment();
                    break;
                case 40:
                    e.preventDefault();
                    _this.decrement();
                    break;
                case 8: // backspace
                case 46:
                    e.preventDefault();
                    _this.setValue(0);
                    _this.buffer.reset();
                    _this.selectAll();
                    break;
                case 9:
                    break;
                default:
                    // F1-12 and numbers only
                    if (!(!e.ctrlKey && e.keyCode >= 112 && e.keyCode <= 123)
                        && !(e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57))
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