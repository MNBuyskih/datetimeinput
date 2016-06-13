module Datetime {
    export class FitWidth {
        private $element:JQuery;
        private element:HTMLElement;
        private length:number;

        constructor(element:HTMLElement, length:number, correction:number = 0) {
            this.element = element;
            this.length = length;
            this.$element = $(this.element);
            this.$element.width(spanWidth(this.$element, this.length) + correction);
        }

    }
    export function spanWidth(sourceInput:JQuery, length:number) {
        let span = $('<span>' + StrRepeat('0', length) + '</span>');
        span.css(sourceInput.css(['font', 'padding', 'line-height']));
        $('body').append(span);
        let width = span.outerWidth();
        span.remove();
        return width;
    }
}