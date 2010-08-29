/**
 *  jQuery.popup plugin -- modal popup, content loaded with AJAX request
 *  Copyright (c) 2010 Wayne Walls - wfwalls(at)gmail(dot)com
 *  License: MIT License or GNU General Public License (GPL) Version 2
 *  Date: 29 August 2010
 *  @author Wayne Walls
 *  @version 0.92
 *
 * DEPENDENCY: jQuery.servercomm plugin
 * [ http://github.com/waynewalls/jquery.servercomm ]
 *
 */


// TODO: create private functions to replace all anonymous functions
// TODO: describe popup styles and stylesheet in the documentation
// TODO: add an option that will track popups as part of browser history using Ben Alman's hashchange plugin
// TODO: add keyboard handlers to close popup windows


/*jslint browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true, newcap: true, immed: true */
/*global window, jQuery */


/**
 * The following anonymous function creates a closure that defines
 * the jquery.popup plugin.
 *
 * Inside this function you will find, in order, the following sections:
 * --PRIVATE VARIABLES
 * --PRIVATE FUNCTIONS
 * --INITIALIZATIONS THAT CAN BE DONE IMMEDIATELY
 * --INITIALIZATIONS THAT HAVE TO WAIT UNTIL THE DOM IS READY
 * --PLUGIN NAMESPACE ** PUBLIC PROPERTIES AND METHODS
 *
 */
( function(window, document, $) {


    var
        //
        // --PRIVATE VARIABLES
        //

        // after James Padolsey [ http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/ ]
        // return IE version as an integer or undefined if not IE
        ie = ( function(){

            var undef,
                v = 3,
                div = document.createElement('div'),
                all = div.getElementsByTagName('i');

            do {
                // if this is IE then the i element will be added as a child of div
                // increment v each time through the loop
                div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
            }
            // if this is IE then all[0] will be "truthy" if v is <= to the current version
            while (all[0]);

            return v > 4 ? v : undef;
            
        }() ),

        // the popup plugin stylesheet
        styleText = [
            // stop "jittering" during scrolling in IE6 [ http://www.webmasterworld.com/css/3592524.htm ]
            (ie === 6) ? "body { background-image: url(images/clear1.gif) fixed; }" : "",
            ".ww-popup-matte" + "{ display:none; background-color:black; width:100%; height:100%;",
            // position:fixed -- include IE6 too
            (ie === 6) ? "position: absolute; left: expression((document.documentElement || document.body).scrollLeft); top: expression((document.documentElement || document.body).scrollTop);" : "position:fixed; left:0; top:0px;",
            "}",
            ".ww-popup-container" + "{ display:none; background-color:white; border-bottom:ridge #88afff 4px; overflow:hidden;",
            // position:fixed -- include IE6 too
            (ie === 6) ? "position: absolute;" : "position:fixed;",
            "}",
            ".ww-popup-titlebar { height:25px; background-image:url(images/titlebar.png); }",
            ".ww-popup-title { font-weight:bold; color:white; padding-left:5px; position:relative; top:4px; }",
            ".ww-popup-close { cursor:pointer; padding-right:20px; position:absolute; right:3px; top:4px; background: url(images/close.gif) center right no-repeat; }",
            ".ww-popup-close-label { color:white; text-decoration:underline; position:relative; top:-1px; }"
        ].join(""),

        // style element to be inserted once the DOM is ready
        styleElement = $('<style />').attr("type", "text/css"),

        // storage for already open popups
        popupStorage = [],

        // popup opaque matte
        popupmatte = null,

        // reference to the element (usually a DIV) containing popup content
        // obtained using a jQuery.serverComm AJAX call
        popupContent = null,

        // reference to the active popup
        activepopup = null,


        //
        // --PRIVATE FUNCTIONS
        //

        /**
         * Determine the height of a pop-up window by taking into
         * account the height of the user's browser viewport.
         *
         * @return  {Object} containing two properties top and height
         *
         * @author  Wayne Walls <wayne@schafferwalls.com>
         *
         */
        getPopUpDimensions = function() {
            var windowPadTop = 75,
                windowPadBottom = 50,
                maxHeight = $(window).height() - windowPadTop - windowPadBottom,
                currentHeight = activepopup.outerHeight(),
                popUpHeight = (currentHeight > maxHeight) ? maxHeight : currentHeight;

            return {top:windowPadTop, height:popUpHeight};
        },

        /**
         * Event handler for closing the popup.  Bound when the popup is created
         * in createPopup.
         *
         * @author  Wayne Walls <wayne@schafferwalls.com>
         *
         */
        eventHandler_popupClose = function() {

            var popDims,
                horizontalPosition,
                options = $.popup.options;

            activepopup.remove();
            activepopup = null;

            // if the user had a previously open popup
            if (popupStorage.length !== 0) {

                activepopup = popupStorage.pop();

                activepopup.appendTo(document.body);

                horizontalPosition = ($(window).width() - activepopup.width()) / 2;

                if (ie === 6) {

                    // recalculate the dynamic expressions that simulate position fixed for IE6
                    // they appear to be lost when jQuery's detach() is used to detach the popup from the DOM
                    popDims = getPopUpDimensions();

                    activepopup[0].style.setExpression('top', "(document.documentElement || document.body).scrollTop + " + popDims.top);
                    activepopup[0].style.setExpression('left', "(document.documentElement || document.body).scrollLeft + " + horizontalPosition);
                }
                else {
                    activepopup.css( { left:horizontalPosition } );
                }
            }
            else {

                popupmatte.slideUp("normal", function() {

                    popupmatte.remove();
                    popupmatte = null;

                });
            }

            // check to see if there is a closeCallback function
            if (options.closeCallback && $.isFunction(options.closeCallback)) {
                options.closeCallback.apply((activepopup) ? activepopup[0]:null, (options.closeArgs || [null]));
            }

            // if the user had a previous popup open restore the options associated with the popup
            if (popupStorage.length !== 0) {
                $.popup.options = $.extend($.popup.options, popupStorage.pop());
            }

        },

        /**
         * Create the popup.
         *
         * @author  Wayne Walls <wayne@schafferwalls.com>
         *
         */
        createPopup = function() {

            var browserWindow = $(window),
                options = $.popup.options,
                popDims,
                horizontalPosition;

            // create the popup  and popup titlebar containers
            activepopup = $("<div />", { "class":"ww-popup-container"})
                .append($("<div />", { "class":"ww-popup-titlebar" }));

            // assemble the titlebar components
            activepopup.find("div.ww-popup-titlebar")
                .append($("<span />", { "class":"ww-popup-title", text:options.title }))
                .append($("<span />", { "class":"ww-popup-close", "title":"close", html:"<span class='ww-popup-close-label'>close</span>" }).click(eventHandler_popupClose));

            // append the content element to the pop-up so we can get dimensions
            activepopup.append(popupContent)
                // append the pop-up container so we can get a height
                .css("display", "block")
                .appendTo(document.body);

            // set the width of the pop-up container
            if (typeof options.width === "number") {
                activepopup.css("width", options.width);
            }
            else {
                activepopup.css("width", 600);
            }

            // check to see if the popup is too wide to completely fit inside the browser browser window
            if (activepopup.outerWidth() >= browserWindow.width()) {
                activepopup.width(browserWindow.width() - 20);
                popupContent.css("width", "auto").css("overflow-x", "scroll");
            }

            // go get the height of the pop-up and its y-value for vertical location within the viewport
            popDims = getPopUpDimensions();
            horizontalPosition = (browserWindow.width() - activepopup.width()) / 2;

            // if this is IE6
            if (ie === 6) {
                activepopup[0].style.setExpression('top', "(document.documentElement || document.body).scrollTop + " + popDims.top);
                activepopup[0].style.setExpression('left', "(document.documentElement || document.body).scrollLeft + " + horizontalPosition);
            }
            else {
                activepopup.css("top", popDims.top).css("left", horizontalPosition);
            }

            activepopup.height(popDims.height);

            // set the height of the content element so the scroll bars show correctly
            popupContent.height(popDims.height - activepopup.find("div:first-child").outerHeight() - (parseInt(popupContent.css("padding-top"), 10) + parseInt(popupContent.css("padding-bottom"), 10)));


            // check to see if there is an successCallback function
            if (options.successCallback && $.isFunction(options.successCallback)) {
                options.successCallback.apply(activepopup[0], (options.successArgs || [null]));
            }
        };
    
    //
    // END OF var STATEMENT
    //


    //
    // --INITIALIZATIONS THAT CAN BE DONE IMMEDIATELY
    //
    $(window).bind("resize.ww-popup-event", function() {

        var browserWindow = $(window),
            horizontalPosition;

        if (popupmatte) {

            horizontalPosition = (browserWindow.width() - activepopup.width()) / 2;

            if (ie === 6) {

                activepopup[0].style.setExpression('left', "(document.documentElement || document.body).scrollLeft + " + horizontalPosition);
                popupmatte.css( { width:browserWindow.width(), height:browserWindow.height() } );

            }
            else {

                activepopup.css( { left:horizontalPosition } );
                
            }
        }
    });

    
    //
    // --INITIALIZATIONS THAT HAVE TO WAIT UNTIL THE DOM IS READY
    //
    $(document).ready(function() {

        // prepend the popup stylesheet to the head element
        // [ http://www.phpied.com/dynamic-script-and-style-elements-in-ie/ ]
        // if this is IE
        if (styleElement[0].styleSheet) {

            styleElement[0].styleSheet.cssText = styleText;
        }
        // all other browsers
        else {

            styleElement.text(styleText);
        }

        styleElement.prependTo("head");
    });


    //
    // --PLUGIN NAMESPACE ** PUBLIC PROPERTIES AND METHODS
    //
    $.popup = {

        // PUBLIC PROPERTY -- popup default option settings
        options : {
            
            // url containing the popup content
            url : "",

            // text string to be used as the popup window title
            title : "",

            // width to be used for the popup DIV element
            width : 600,

            // callback to be executed after the popup is successfully displayed
            successCallback : null,

            // arguments to be passed to the successCallback function
            successArgs : null,

            // callback to be executed after the popup is closed
            closeCallback : null,

            // arguments to be passed to the closeCallback function
            closeArgs : null

        },

        /**
         * PUBLIC METHOD
         * configure() is called to set popup options that will act as
         * default values for all subsequent requests.
         *
         * @param   {Object} config contains the option properties and their
         * values to be changed
         *
         */
        configure : function(config) {

            // get the user submitted configuration options
            config = config || {};
            this.options = $.extend(this.options, config);

        },

        /**
         * PUBLIC METHOD
         * popupOpen() returns true if a popup is open otherwise false
         *
         */
        popupOpen : function() {
            return ( activepopup !== null );
        },


        /**
         * PUBLIC METHOD
         * show() is called to display a pop-up window
         *
         * @param   {Object} config contains the option properties and their
         * values to be used for this invocation of show()
         *
         * @return  none
         *
         * @author  Wayne Walls <wayne@schafferwalls.com>
         */
        show : function(config) {
            
            var browserWindow = $(window),
                temp;

            // see if there is an existing popup -- if yes then detach and save it along with its options
            if (activepopup) {
                popupStorage.push($.extend(temp, this.options));
                popupStorage.push(activepopup.detach());
            }

            // get the user submitted configuration options for this call
            config = config || {};
            this.options = $.extend(this.options, config);

            // get the content for this popup
            $.serverComm.contactServer( {

                url:$.popup.options.url,
                method: "GET",
                successCallback : function(response) {

                    // get the content portion of the serverComm response
                    popupContent = $(response.split("|")[1]);

                    // If there is no existing popup add the translucent black matte
                    if (popupmatte === null) {

                        popupmatte = $("<div />", {
                            "class" : "ww-popup-matte",
                            css : { opacity:0.70 }
                        }).appendTo(document.body);

                        if (ie === 6) {
                            popupmatte.css( { height:browserWindow.height(), width:browserWindow.width() } );
                        }

                        // OK we're ready, slide down the matte and show the popup
                        popupmatte.slideDown("normal", createPopup);
                    }
                    else {

                        // if there is an existing popup then just show it
                        // no need for another black matte
                        createPopup();

                    }
                }
            });
        }
    };
    
}(window, document, jQuery) );


