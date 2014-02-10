var FEED_VIEW_PAGE_IDX = 0;
var ADD_PICTURES_VIEW_PAGE_IDX = 1;
var LIFE_STREAM_VIEW_PAGE_IDX = 2;
var SHARE_VIEW_PAGE_IDX = 3;
var LIFE_STREAM_SHARE_PAGE_IDX = 4;
var SELECT_FRIEND_VIEW_IDX = 5;

var LOCALDEV_SERVER = 'http://127.0.0.1:8000';
var CENTRALDEV_SERVER = 'http://drtyhbo.net';

$(document).ready(function () {
    $(document.body).show();
    setTimeout(function () {
//        Util.init(CENTRALDEV_SERVER);
        Util.init(LOCALDEV_SERVER);
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
            // NOTE: Was getting stuck on various pages with no way out so
            // I left the big three that are accessible via the tabs at the
            // bottom. Maybe only uncomment for testing?
/*            if (localStorage.getItem('current-view') == ADD_PICTURES_VIEW_PAGE_IDX)
                AddPicturesView.show(false);
            else if (localStorage.getItem('current-view') == LIFE_STREAM_VIEW_PAGE_IDX)
                LifeStreamView.show(false);
            else if (localStorage.getItem('current-view') == LIFE_STREAM_SHARE_PAGE_IDX)
                LifeStreamShareView.show(null, false);
            else if (localStorage.getItem('current-view') == SELECT_FRIEND_VIEW_IDX)
                SelectFriendsView.show(false);
            else if (localStorage.getItem('current-view') == SHARE_VIEW_PAGE_IDX) {
                var loadedShareIds = localStorage.getItem('loaded-share-ids');
                //localStorage.removeItem('loaded-share-ids');
                if (!loadedShareIds)
                    LifeStreamView.show(false);
                else {
                    var shareIds = loadedShareIds.split(',').map(function (x) { return parseInt(x) });
                    ShareView.show(Share.getShares(shareIds), false);
                }
            }*/
            if (localStorage.getItem('current-view') == LIFE_STREAM_VIEW_PAGE_IDX) {
                LifeStreamView.show(false);
            } else if (localStorage.getItem('current-view') == ADD_PICTURES_VIEW_PAGE_IDX) {
                AddPicturesView.show(false);
            } else {
                FeedView.show(false);
            }
        }
    });
}