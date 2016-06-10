(function ($) {
    $.fn.datetime = function (model:Date) {
        return new Datetime.DateTime($(this)[0], model);
    };
    $.fn.datetimeInputFitWidth = function (length:number, correction?:number) {
        $.each(this, (n, el) => new Datetime.DatetimeInputFitWidth(el, length, correction));
    };
})(jQuery);