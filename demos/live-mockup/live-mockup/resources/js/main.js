var FEED_VIEW_PAGE_IDX = 0;
var ADD_PICTURES_VIEW_PAGE_IDX = 1;
var LIFE_STREAM_VIEW_PAGE_IDX = 2;
var SHARE_VIEW_PAGE_IDX = 3;

$(document).ready(function () {
    $(document.body).show();
    setTimeout(function () {
        Util.init();
        ServerSettings.init(ServerSettings.CENTRALDEV_SERVER_IDX);
        CameraRoll.init(initApp);
    }, 400);
});

function initApp() {
    Db.init(function() {
        Feed.init();
        PersonalLibrary.init();
        if (!PictureWidgets.getPictures().length) {
            RegistrationAddPicturesPage.show(false);
        } else if (!Users.getCurrentUser() || !Users.getCurrentUser().name) {
            RegistrationCreateUserPage.show(false);
        } else {
            if (localStorage.getItem('current-view') == ADD_PICTURES_VIEW_PAGE_IDX)
                AddPicturesView.show(false);
            else if (localStorage.getItem('current-view') == LIFE_STREAM_VIEW_PAGE_IDX)
                LifeStreamView.show(false);
            else if (localStorage.getItem('current-view') == SHARE_VIEW_PAGE_IDX) {
                var loadedShareIds = localStorage.getItem('loaded-share-ids');
                //localStorage.removeItem('loaded-share-ids');
                if (!loadedShareIds)
                    LifeStreamView.show(false);
                else {
                    var shareIds = loadedShareIds.split(',').map(function (x) {return parseInt(x)});
                    ShareView.show(Share.getShares(shareIds), false);
                }
            }
            else
                FeedView.show(false);
        }
    });
}

var Session = {
    
}
