# jQuery serverComm Plugin #

Version: 0.9  
Date: 28 June 2010  
License: MIT License or GNU General Public License (GPL) Version 2   
Example at: [http://waynewalls.com/servercomm/](http://waynewalls.com/servercomm/)

## BACKGROUND ##

This plugin provides a user interface (UI) and simple API for
$.ajax().  It was developed for a training applications whose primary user
group was in West Africa. This region of the world--at the time--was served by
a single Internet backbone traveling up the west side of the continent.
Internet use involved long latency and frequent dropped connections. Because of
this, we wanted a UI that would keep the user informed about connection status
and also retry automatically in case of a dropped connection.

## LIMITATIONS ##

At present, the serverComm plugin only supports the POST method
of sending data to the server and the text data type for receiving responses
from the server.  To keep the UI simple, it currently handles only one request
at a time.


## serverComm DEPENDENCIES ##

Requires jQuery v1.4;  there are no other dependencies.


## serverComm USAGE ##

`$.serverComm.contactServer( config )`  
where config is an optional object containing serverComm options.

Example:

    $.serverComm.contactServer( {
        url:serverComm.php,
        dataObject:{ key1:value1, key2,value2 },
        successCallback:onSuccess   
    } );
    

## serverComm OPTIONS (type) [ default value ] ##

`$.serverComm.options.url (string) [ empty string ]`  
The URL to assign to the $.ajax() URL property

`$.serverComm.options.dataObject (object) [ null ]`  
An object to be assigned to the $.ajax() data property

`$.serverComm.options.autoRetrys (integer) [ 4 ]`  
The number of times to automatically retry the request

`$.serverComm.options.autoTimeout (integer) [ 7000 ]`  
The number of milliseconds to wait for a response from the server

`$.serverComm.options.giveupCallback (function(error)) [ null ]`  
A function that will be called after the last automatic retry.  It is passed
the error that it returned by the server-side script or $.ajax()

`$.serverComm.options.errorCallback (function(error, request)) [ null ]`  
A function that will be called before initiating each automatic retry.    It is
passed the error that it returned by the server-side script or $.ajax() and the
number of request attempts.

`$.serverComm.options.successCallback (function(response)) [ null ]`  
A function that will be called after each successful connection attempt. It is
passed the text string that $.ajax() passes to its success callback.

`$.serverComm.options.contactPromptText (string) [ "Contacting server" ]`  
A string shown in UI prompt during the first connection attempt.  The string
can include HTML that can be contained within inline element.

`$.serverComm.options.giveupPromptText (string) [ "The problem hasn't gone away
&mdash; try again later" ]`  
A string shown in UI prompt after the last automatic retry has failed.  The
string can include HTML that can be contained within inline element.

`$.serverComm.options.successPromptText (string) [ "Contacting server &mdash;
SUCCESS!" ]`  
A string shown in UI prompt after a successful automatic retry.  The string can
include HTML that can be contained within inline element.

`$.serverComm.options.contactImagePath (string) [ "images/busy999.gif" ]`  
The path to an image that will be displayed in the UI prompt during the initial
connection attempt.

`$.serverComm.options.problemImagePath (string) [ "images/busy666.gif" ]`  
The path to an image that will be displayed in the UI prompt during automatic
retries.

`$.serverComm.options.closeBoxImagePath (string) [ "images/close.gif" ]`  
The path to an image that will be used as a close box in the UI prompt that is
shown after all automatic retries have failed.

`$.serverComm.options.responseSeparator (string) [ "|" ]`  
The character used by the server-side script to separate the connection status
from data being returned to the client.


## serverComm PUBLIC METHODS ##

`$.serverComm.configure( config )`  
Sets serverComm options where config is an object containing new options that
will act as default values for subsequent requests.

`$.serverComm.activeConnection()`  
Returns a boolean; true if there is an active serverComm request otherwise
false.

`$.serverComm.inprocessWarning()`  
Displays an absolutely positioned prompt in the center of the user's window
that says, "Please Wait!".  Used in conjunction with activeConnection() to
prevent simultaneous serverComm requests.

`$.serverComm.contactServer( config )`  
Initiates a serverComm request where config is an optional object containing
serverComm options as key/value pairs.
