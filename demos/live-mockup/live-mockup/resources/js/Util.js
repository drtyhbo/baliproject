var Util = {
  GET: {},
  baseUrl: null
}

/*
 * Initializes the utilities.
 */
Util.init = function(host) {
  var keyValuePairs = window.location.search.substr(1).split('&');
  for (var i = 0, pair; pair = keyValuePairs[i]; i++) {
    var keyValue = pair.split('=');
    Util.GET[keyValue[0]] = decodeURIComponent(keyValue[1]);
  }
  
  if (Util.GET['host']) {
      Util.baseUrl = Util.GET['host'];
  } else {
      Util.baseUrl = host || 'http://drtyhbo.net';
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
    if (elapsedMs < 1000) {
        return "now";
    }
    if (elapsedMs < 60 * 1000) {
        return Math.floor(elapsedMs / 1000) + 's';
        // minutes...
    } else if (elapsedMs < 60 * 60 * 1000) {
        return Math.floor(elapsedMs / 60 / 1000) + 'm';
        // hours...
    } else if (elapsedMs < 24 * 60 * 60 * 1000) {
        return Math.floor(elapsedMs / (60 * 60) / 1000) + 'h';
    } else {
        return Math.floor(elapsedMs / (24 * 60 * 60) / 1000) + 'd';        
    }
}

Util.daysOfTheWeek = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

Util.months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

Util.getElapsedTimeStringLong = function(timestamp) {
  var elapsedMs = new Date().getTime() - timestamp;

  // seconds...
  if (elapsedMs < 1000) {
    return "now";
  }
  if (elapsedMs < 60 * 1000) {
    return Math.floor(elapsedMs / 1000) + ' seconds ago';
  // today?
  }

  var today = new Date();
  var yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  var date = new Date(timestamp);

  var time = (date.getHours() % 12 == 0 ? 12 : date.getHours() % 12) + ':' +
      (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +
      ' ' + (date.getHours() < 12 ? 'am' : 'pm');

  if (elapsedMs < 24 * 60 * 60 * 1000 &&
      today.getDate() == date.getDate()) {
    return 'today, ' + time;
  } else if (elapsedMs < 2 * 24 * 60 * 60 * 1000 &&
      yesterday.getDate() == date.getDate()) {
    return 'yesterday, ' + time;
  // in the last week?
  } else if (elapsedMs < 7 * 24 * 60 * 60 * 1000) {
    return Util.daysOfTheWeek[date.getDay()] + ', ' + time;
  } else {
    return Util.months[date.getMonth()] + ' ' + date.getDate() + ', ' +
        date.getFullYear() + ', ' + time;
  }
};

/*
 *  get elapsed time in string format (i.e. 5m, 2h...)
 */
Util.getElapsedTimeString = function (timeStamp) {
  var elapsedMs = new Date().getTime() - timeStamp;

  // seconds...
  if (elapsedMs < 1000) {
      return "now";
  }
  if (elapsedMs < 60 * 1000) {
      return Math.floor(elapsedMs / 1000) + 's';
      // minutes...
  } else if (elapsedMs < 60 * 60 * 1000) {
      return Math.floor(elapsedMs / 60 / 1000) + 'm';
      // hours...
  } else if (elapsedMs < 24 * 60 * 60 * 1000) {
      return Math.floor(elapsedMs / (60 * 60) / 1000) + 'h';
  } else {
      return Math.floor(elapsedMs / (24 * 60 * 60) / 1000) + 'd';        
  }
};

/*
 * Issues an AJAX request to the specified path. Automatically prefixes the
 * path with the server url.
 */
Util.makeRequest = function(path, data, success) {
    $.ajax(Util.baseUrl + '/' + path, {
        data: data,
        success: success,
        type: 'POST'
    });  
};


Util.getServerBaseUrl = function () {

}

Util.alert = function (msg) {
    alert(msg);
}

var Images = {};

Images.getPath = function(subpath) {
  return isIOS ? '' : ('img/' + (subpath || ''));
};