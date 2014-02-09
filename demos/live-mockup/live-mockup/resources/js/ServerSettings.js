
ServerSettings = {
    Url: null,
    IsDev: false
}

ServerSettings.LOCALDEV_SERVER_IDX = 0;     //local host
ServerSettings.CENTRALDEV_SERVER_IDX = 1;   //ec2 instance

ServerSettings.init = function (serverIdx) {
    ServerSettings.IsDev = true;
    if (serverIdx == ServerSettings.LOCALDEV_SERVER_IDX)
        ServerSettings.Url = 'http://127.0.0.1:8000/';
    else 
        ServerSettings.Url = 'http://drtyhbo.net/';
}

ServerSettings.getServerUrl = function () {
    return ServerSettings.Url;
}