(function ($) {
    $.fn.datetime = function (model:Date) {
        return new Datetime.DateTime($(this)[0], model);
    };
    $.fn.datetimeInputFitWidth = function (length:number, correction?:number) {
        $.each(this, (n, el) => new Datetime.FitWidth(el, length, correction));
    };
})(jQuery);