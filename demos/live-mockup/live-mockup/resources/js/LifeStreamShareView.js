var LifeStreamShareItem = Class.extend({
    init: function (moment, pageWidth) {
        this.moment = moment;
        this.pageWidth = pageWidth;
    },

    /**
    * Returns this feed item as a jQuery object that can be inserted into the
    * dom.
    */
    getEl: function (isEven) {

        //top level element
        this.el = $('<div></div>')
                .css({
                    clear: 'both',
                    paddingBottom: '5px'
                });

        var headerEl = $('<div></div>')
                .css({
                    margin: '10px 5px',
                    position: 'relative',
                    textShadow: 'none'
                })
				.appendTo(this.el);
        this.moment.location = 'Berkeley, California'
        var locationEl = $('<div></div>')
				.css({
				    fontSize: '11px',
				    left: 0,
				    lineHeight: '11px',
				})
				.text((this.moment.location ?
                            (this.moment.location + ' \u00B7 ') : '') +
                            this.moment.getElapsedTime())
				.appendTo(headerEl);

        //generate user thumbnails
        var users = this.moment.getWidgetOwners();
        if (users && users.length > 1) {
            var tumbnailContainerEl = $('<div></div>')
               .css({
                   padding: '4px 0px 0px 4px',
                   height: '32px',
                   position: 'relative'
               })
               .appendTo(headerEl);

            for (username in users) {
                var thumbnailEl1 = $('<span></span>')
                    .css({
                        backgroundImage: 'url(' + users[username].thumbnailSrc + ')',
                        backgroundSize: 'cover',
                        borderRadius: '100%',
                        height: '32px',
                        width: '32px',
                        display: 'inline-block',
                        position: 'relative',
                        float: 'left',
                        marginRight: '3px'
                    })
                    .appendTo(tumbnailContainerEl);
            }
        }

        //generate pictures
        var pictureContainerEl = $('<div></div>')
            .css({
                position: 'relative'
            })
            .appendTo(this.el);
        var addPictures = new AddPictures(
                this.pageWidth, false, true, null,
                this.moment.widgets, 1, 3);
        addPictures.getEl()
              .appendTo(pictureContainerEl);


        return this.el;
    }

});

var LifeStreamShareView = {
    headerEl: null,
    profilePicEl: null,
    footerEl: null,
    ui: null,
    lifeStream: null
};

/**
 * Makes the life stream view the current view.
 */
LifeStreamShareView.show = function (lifeStream, animate) {
    LifeStreamShareView.lifeStream = lifeStream;
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
                            LifeStreamShareView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#life-stream-share-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

/**
 * Event handler. Called before the life stream view is made visible:
 * used to wire up buttons and loads content of life stream
 */
LifeStreamShareView.beforeTransition = function (event, ui) {
    if (ui.absUrl.indexOf('#life-stream-share-view') == -1) {
        $.mobile.pageContainer.off('pagecontainerbeforetransition',
                    arguments.callee);
        return;
    }

    if (LifeStreamShareView.shown) {
        return;
    }
    LifeStreamShareView.shown = true;

    //save pointer to UI elements
    LifeStreamShareView.ui = ui;
    LifeStreamShareView.headerEl = ui.toPage.find('#load-view-header');
    LifeStreamShareView.footerEl = ui.toPage.find('#load-view-footer');

    //reload 
    if (!LifeStreamShareView.lifeStream) {
        LifeStreamShareView.lifeStream = new LifeStream();
        LifeStreamShareView.lifeStream.loadData(LifeStreamShareView.loadMoments);
    }
    else
        LifeStreamShareView.loadMoments(LifeStreamShareView.lifeStream.moments);
};

LifeStreamShareView.loadMoments = function (moments) {
    //load all moments
    var momentsEl = LifeStreamShareView.ui.toPage.find('#moments');
    momentsEl.empty();
    for (var idx = 0, moment; moment = moments[idx]; idx++)
        new LifeStreamShareItem(moment, LifeStreamShareView.ui.toPage.width()).getEl((idx % 2 == 0)).appendTo(momentsEl);

    //save current view
    localStorage.setItem('current-view', LIFE_STREAM_SHARE_PAGE_IDX);

    //wire buttons
    var backBtn = LifeStreamShareView.ui.toPage.find('#back-button')
        .on(TOUCHSTART, function () {
            LifeStreamView.show(LifeStreamShareView.lifeStream, false);
        });

    var shareBtn = LifeStreamShareView.ui.toPage.find('#share-btn')
        .on(TOUCHSTART, function () {
            SelectFriendsView.show(false);
        });
}