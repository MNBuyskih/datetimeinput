module Datetime {
    export class DateTime {
        private $element:JQuery;
        private $wrap:JQuery;
        private dayInput:Input;
        private monthInput:Input;
        private yearInput:Input;
        private hoursInput:Input;
        private minutesInput:Input;
        event = new Event();

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

            this.dayInput = new Input(this.$wrap.find('input[data-model="day"]'), 31, 0, () => LastDayOfMonth(this.model.getMonth()));
            this.dayInput.event.on('change', (value:number, next:boolean) => {
                value = Math.min(value, LastDayOfMonth(this.model.getMonth()));
                this.dayInput.buffer.viewValue = value.toString();
                if (value > 0) this.model.setDate(value) && this.event.trigger('change', this.model);
                if (next && value > 3) this.monthInput.focus();
            });
            this.dayInput.event.on('next', () => this.monthInput.focus());

            this.monthInput = new Input(this.$wrap.find('input[data-model="month"]'), 12, 1);
            this.monthInput.event.on('change', (value:number, next:boolean) => {
                value = Math.min(value, 12);
                this.dayInput.setValue(Math.min(this.model.getDate(), LastDayOfMonth(value)));
                this.model.setMonth(value);
                this.event.trigger('change', this.model);
                if (next && value > 1) this.yearInput.focus();
            });
            this.monthInput.event.on('prev', () => this.dayInput.focus());
            this.monthInput.event.on('next', () => this.yearInput.focus());

            this.yearInput = new Input(this.$wrap.find('input[data-model="year"]'), 9999);
            this.yearInput.event.on('change', (value:number, next:boolean) => {
                value = Math.min(value, 9999);
                this.model.setFullYear(value);
                this.event.trigger('change', this.model);
                if (next && value.toString().length > 3) this.hoursInput.focus();
            });
            this.yearInput.event.on('prev', () => this.monthInput.focus());
            this.yearInput.event.on('next', () => this.hoursInput.focus());

            this.hoursInput = new Input(this.$wrap.find('input[data-model="hours"]'), 23);
            this.hoursInput.event.on('change', (value:number, next:boolean) => {
                value = Math.min(value, 23);
                this.model.setHours(value);
                this.event.trigger('change', this.model);
                if (next && value > 2) this.minutesInput.focus();
            });
            this.hoursInput.event.on('prev', () => this.yearInput.focus());
            this.hoursInput.event.on('next', () => this.minutesInput.focus());

            this.minutesInput = new Input(this.$wrap.find('input[data-model="minutes"]'), 59);
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
}