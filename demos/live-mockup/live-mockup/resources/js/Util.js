
var Util = {
  GET: {}
}

/*
 * Initializes the utilities.
 */
Util.init = function() {
  var keyValuePairs = window.location.search.substr(1).split('&');
  for (var i = 0, pair; pair = keyValuePairs[i]; i++) {
    var keyValue = pair.split('=');
    Util.GET[keyValue[0]] = decodeURIComponent(keyValue[1]);
  }  
};

/*
 *  get date in the past 
 */
Util.getPastDate = function (minutes, hours, days) {
    minutes = minutes || 0;
    hours = hours || 0;
    days = days || 0;
    return new Date().getTime() - minutes * 60 * 1000 - hours * 60 * 60 * 1000 - days * 24 * 60 * 60 * 1000;
}

/*
 *  get elapsed time in string format (i.e. 5m, 2h...)
 */
Util.getElapsedTime = function (timeStamp) {
    var elapsedMs = new Date().getTime() - timeStamp;

    // seconds...
    if (elapsedMs < 60 * 1000) {
        return Math.floor(elapsedMs / 1000) + 's';
        // minutes...
    } else if (elapsedMs < 60 * 60 * 1000) {
        return Math.floor(elapsedMs / 60 / 1000) + 'm';
        // hours...
    } else if (elapsedMs < 24 * 60 * 60 * 1000) {
        return Math.floor(elapsedMs / (60 * 60) / 1000) + 'h';
    } else if (elapsedMs < 7 * 24 * 60 * 60 * 1000){
        return Math.floor(elapsedMs / (24 * 60 * 60) / 1000) + 'd';        
    } else {
        var date = new Date(timeStamp);
        return (date.getMonth() + 1) + '/' + date.getDate() +
                '/' + date.getFullYear();
    }
}

/*
 * Issues an AJAX request to the specified path. Automatically prefixes the
 * path with the server url (currently http://drtyhbo.net/).
 */
Util.makeRequest = function(path, data, success) {
    var host = Util.GET['host'] || ServerSettings.getServerUrl();
    $.ajax(host + path, {
        data: data,
        success: success,
        type: 'POST'
    });  
};


Util.getServerBaseUrl = function () {

}

var Images = {};

Images.getPath = function(subpath) {
  return isIOS ? '' : ('img/' + (subpath || ''));
};