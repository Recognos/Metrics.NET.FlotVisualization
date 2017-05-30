(function (win, $) {
	'use strict';

    $(win).on('load', function () {
	    $('.dropdown-menu').css('max-height', Math.max(window.innerHeight - 80, 120));
            });

	$(win).on('resize', function () {
	    $('.dropdown-menu').css('max-height', Math.max(window.innerHeight - 80, 120));
            });
       
})(this, this.jQuery);