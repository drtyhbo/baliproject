var Util = {
}

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
    }
}
