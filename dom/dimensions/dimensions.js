
steal.plugins('jquery/dom').then(function($) {


var weird = /button|select/i, //margin is inside border
	getBoxes = {},
    checks = {
        width: ["Left", "Right"],
        height: ['Top', 'Bottom'],
        oldOuterHeight: $.fn.outerHeight,
        oldOuterWidth: $.fn.outerWidth,
        oldInnerWidth: $.fn.innerWidth,
        oldInnerHeight: $.fn.innerHeight
    },
	getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
	rupper = /([A-Z])/g,
	rdashAlpha = /-([a-z])/ig,
	fcamelCase = function(all, letter) {
	    return letter.toUpperCase();
	},
	getStyle = function(elem) {
	    if (getComputedStyle) {
	        return getComputedStyle(elem, null);
	    }
	    else if (elem.currentStyle) {
	        return elem.currentStyle
	    }
	},
	rfloat = /float/i,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/;
/**
 * @function jQuery.curStyles
 * @param {HTMLElement} el
 * @param {Array} styles An array of style names like <code>['marginTop','borderLeft']</code>
 * @return {Object} an object of style:value pairs.  Style names are camelCase.
 */
$.curStyles = function(el, styles) {
    var currentS = getStyle(el), 
				   oldName, 
				   val, 
				   style = el.style,
				   results = {},
				   i=0,
				   name;
    
	for(; i < styles.length; i++){
		name = styles[i];
        oldName = name.replace(rdashAlpha, fcamelCase);
		
		if ( rfloat.test( name ) ) {
			name = jQuery.support.cssFloat ? "float" : "styleFloat";
			oldName = "cssFloat"
		}
		
        if (getComputedStyle) {
            name = name.replace(rupper, "-$1").toLowerCase();
            val = currentS.getPropertyValue(name);
			if ( name === "opacity" && val === "" ) {
				val = "1";
			}
			results[oldName] = val;
        } else {
            var camelCase = name.replace(rdashAlpha, fcamelCase);
            results[oldName] = currentS[name] || currentS[camelCase];


            if (!rnumpx.test(results[oldName]) && rnum.test(results[oldName])) { //convert to px
                // Remember the original values
                var left = style.left, 
					rsLeft = el.runtimeStyle.left;

                // Put in the new values to get a computed value out
                el.runtimeStyle.left = el.currentStyle.left;
                style.left = camelCase === "fontSize" ? "1em" : (results[oldName] || 0);
                results[oldName] = style.pixelLeft + "px";

                // Revert the changed values
                style.left = left;
                el.runtimeStyle.left = rsLeft;
            }

        }
    }
	
    return results;
};
$.fn.curStyles = function(){
	return $.curStyles(this[0], $.makeArray(arguments))
}
/**
 *  @add jQuery.fn
 */
$.each({ 

/*
 * @function outerWidth
 * @parent dom
 * Lets you set the outer height on an object
 * @param {Number} [height] 
 */
width: 
/*
 * @function innerWidth
 * @parent dom
 * Lets you set the inner height on an object
 * @param {Number} [height] 
 */
"Width", 
/*
 * @function outerHeight
 * @parent dom
 * Lets you set the outer width on an object
 * @param {Number} [height] 
 */
height: 
/*
 * @function innerHeight
 * @parent dom
 * Lets you set the outer width on an object
 * @param {Number} [height] 
 */
"Height" }, function(lower, Upper) {

    //used to get the padding and border for an element in a given direction
    getBoxes[lower] = function(el, boxes) {
        var val = 0;
        if (!weird.test(el.nodeName)) {
            //make what to check for ....
            var myChecks = [];
            $.each(checks[lower], function() {
                var direction = this;
                $.each(boxes, function(name, val) {
                    if (val)
                        myChecks.push(name + direction);
                })
            })
            $.each($.curStyles(el, myChecks), function(name, value) {
                val += (parseFloat(value) || 0);
            })
        }
        return val;
    }

    //getter / setter
    $.fn["outer" + Upper] = function(v, margin) {
        if (typeof v == 'number') {
            this[lower](v - getBoxes[lower](this[0], {padding: true, border: true, margin: margin}))
            return this;
        } else {
            return checks["oldOuter" + Upper].call(this, v)
        }
    }
    $.fn["inner" + Upper] = function(v) {
        if (typeof v == 'number') {
            this[lower](v - getBoxes[lower](this[0], { padding: true }))
            return this;
        } else {
            return checks["oldInner" + Upper].call(this, v)
        }
    }
    //provides animation
    $.fx.step["outer" + Upper] = function(fx) {
        if (fx.state == 0) {
            fx.start = $(fx.elem)[lower]();
            fx.end = fx.end - getBoxes[lower](fx.elem,{padding: true, border: true});
        }
        fx.elem.style[lower] = (fx.pos * (fx.end - fx.start) + fx.start) + "px"
    }
})

})
