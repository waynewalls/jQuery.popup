# jQuery popup Plugin #

Version: 0.93  
Date: 01 September 2010  
License: MIT License or GNU General Public License (GPL) Version 2   
Example at: [http://waynewalls.com/popup/](http://waynewalls.com/popup/)

Tested with: Internet Explorer 6, 7, and 8; Firefox 3-3.6; Chrome 5, 6; Safari 5

## BACKGROUND ##

This plugin was developed to support a training application that displays
reference materials and questions in modal-like popup "windows." Because
questions may appear when a reference popup is open, the plugin allows more than
one popup to be open at a time--but only one is visible. When a popup is closed,
any previously open popup is redisplayed. HTML-formatted content for the popup
is obtained from an external file using the [jQuery.servercomm](http://waynewalls.com/servercomm/) plugin.

## LIMITATIONS ##

The first line of the external file containing popup content MUST contain the
string "Success|" as its initial content. This string is removed with the
remaining content passed to $.popup as html. This limitation will be removed in
a future version.


## popup DEPENDENCIES ##

Requires jQuery v1.4+;  
requires jQuery.servercomm plugin [http://waynewalls.com/servercomm/](http://waynewalls.com/servercomm/);  
there are no other dependencies.


## popup USAGE ##

`$.popup.show( config )`  
where config is an optional object containing popup options.

Example:

    $.popup.show( { 
        url : "content1.html", 
        title : "Title Text", 
        successCallback : function(color) { 
            $(this).find(".ww-popup-title").css("color", color); 
        }, 
        successArgs : ["#009"] 
    } );
    

## popup OPTIONS (type) [ default value ] ##

`// popup options default values are available in $.popup.optionDefaults`

`$.popup.options.url (string) [ empty string ]`  
The URL for the file that contains the popup content

`$.popup.options.title (object) [ empty string ]`  
A text string to be used for the popup title bar title text 

`$.popup.options.width (integer) [ 600 ]`  
Width in pixels of the popup container DIV element

`$.popup.options.successCallback (function()) [ null ]`  
A function that will be called after the popup is created, inserted into the
DOM, and just before it is rendered. The function context (this) is set to the
DIV element serving as the popup container.

`$.popup.options.successArgs (array) [ null ]`   
An array of values that will be passed as arguments to the successCallback
function using the apply() method.

`$.popup.options.closeCallback (function()) [ null ]`  
A function that will be called after the popup is closed and removed from the
DOM. The function context (this) is set to the DIV element serving as the popup
container for any previously displayed popup. If there was no previous popup
then the function content is set to null.

`$.popup.options.closeArgs (array) [ null ]`  
An array of values that will be passed as arguments to the closeCallback
function using the apply() method.


## popup PUBLIC METHODS ##

`$.popup.configure( config )`  
Sets popup options where config is an object containing new values that
will act as defaults for subsequent requests.

`$.popup.popupOpen()`  
Returns true if a popup is open otherwise false.

`$.popup.show( config )`  
Displays a popup based on the values passed in the config parameter.


## popup KNOWN ISSUES

jQuery.popup uses a background image on the body to prevent jittering in
Internet Explorer 6 when the page is scrolled and a popup is open (see
[http://www.webmasterworld.com/css/3592524.htm](http://www.webmasterworld.com/css/3592524.htm)).
Recent css reset stylesheets that set background:transparent on the body
interfere with this "fix." To work around this problem use conditional comments
or other method of detecting IE6 and add, { background:#fff url(images/clear1.gif) fixed },
with a color of you choice, as a body style after the reset stylesheet has loaded.
