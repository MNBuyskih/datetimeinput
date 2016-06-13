module Datetime {
    export class DatetimeInputFitWidth {
        private $element:JQuery;
        private element:HTMLElement;
        private length:number;

        constructor(element:HTMLElement, length:number, correction:number = 0) {
            this.element = element;
            this.length = length;
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
}