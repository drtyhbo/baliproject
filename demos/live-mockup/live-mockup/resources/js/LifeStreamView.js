var LifeStreamItem = Class.extend({
    init: function (moment) {
        this.moment = moment;
    },

    /**
    * Returns this feed item as a jQuery object that can be inserted into the
    * dom.
    */
    getEl: function (isEven) {

        //top level element
        this.el = $('<div></div>')
				.css({
				    paddingBottom: '10px'
				});
        if (!isEven)
            this.el.css({
                background: '#eee'
            });


        var headerEl = $('<div></div>')
				.addClass('stream-view-header')
				.appendTo(this.el);

        //generate location & time
        var locationTimeContainerEl = $('<div></div>')
				.css({
				    position: 'relative'
				})
				.appendTo(headerEl);
        var locationEl = $('<div></div>')
				.css({
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'relative',
                    float:'left'
				})
				.text(this.moment.location)
				.appendTo(locationTimeContainerEl);
        var timeEl = $('<div></div>')
				.css({
                    paddingRight: '4px',
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'relative',
				    float: 'right'
				})
				.text(this.moment.getElapsedTime())
				.appendTo(locationTimeContainerEl);

        //generate user thumbnails
        var users = this.moment.getWidgetOwners();
        if (users && Object.keys(users).length > 1) {
            var tumbnailContainerEl = $('<div></div>')
               .css({
                   padding: '4px 0px 0px 4px',
                   height: '32px',
                   //background: '#eee',
                   position: 'relative',
                   clear: 'left'
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
                padding: '6px 0px 8px 0px',
                position: 'relative',
                clear: 'left'
            })
            .appendTo(this.el);
        var addPictures = new AddPictures(LifeStreamView.ui.toPage.width(), false, false, null, this.moment.widgets);
        addPictures.getEl()
              .appendTo(pictureContainerEl);

        //add comment
        var commentsLinkContainerEl = $('<div></div>')
					.css({
					    marginBottom: '10px',
					    textAlign: 'right'
					})
					.appendTo(this.el);
        this.commentLinkEl = $('<span></span>')
                .css({
                    color: 'blue',
                    fontSize: '12px',
                    lineHeight: '12px',
                    cursor: 'pointer',
                    paddingRight: '6px'
                })
                .text('5 comments in 6 shares')
                .appendTo(commentsLinkContainerEl);

        /*
        this.createPicturesEl();

        this.commentsEl = $('<div></div>')
				.css({
				    margin: '10px 10px 0 10px'
				})
				.appendTo(this.el);
        if (this.share.description) {
            this.getCommentEl(this.share.user, this.share.description)
					.appendTo(this.commentsEl);
        }

        for (var i = 0, comment; comment = this.share.comments[i]; i++) {
            this.getCommentEl(comment.user, comment.comment)
					.appendTo(this.commentsEl);
        }
        this.createNewCommentEl();

        var buttonsEl = $('<div></div>')
				.css({
				    margin: '10px 10px 0 0',
				    textAlign: 'right'
				})
				.appendTo(this.el)
        this.commentButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
				    fontSize: '11px',
				})
				.text('Comment')
				.on(TOUCHEND, this.onTouchCommentButton.bind(this))
				.appendTo(buttonsEl);
        this.shareButtonEl = $('<button></button>')
				.addClass('ui-btn ui-btn-inline')
				.css({
				    fontSize: '11px',
				    marginRight: 0
				})
				.text('Share')
				.on(TOUCHEND, this.onTouchShareButton.bind(this))
				.appendTo(buttonsEl);
        */

        return this.el;
    }
});

var LifeStreamView = {
    headerEl: null,
    profilePicEl: null,
    footerEl: null,
    ui: null,
};


LifeStreamView.DisplayLifeStream = function (lifeStream) {
    if (!lifeStream)
        throw "lifeStream not initalized";
}

/**
 * Makes the life stream view the current view.
 */
LifeStreamView.show = function (animate) {
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
                            LifeStreamView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#life-stream-load-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

/**
 * Event handler. Called before the life stream view is made visible:
 * used to wire up buttons and loads content of life stream
 */
LifeStreamView.beforeTransition = function (event, ui) {
    if (ui.absUrl.indexOf('#life-stream-load-view') == -1) {
        $.mobile.pageContainer.off('pagecontainerbeforetransition',
                    arguments.callee);
        return;
    }

    //wire footer buttons
    var homeBtn = ui.toPage.find('#home-btn')
        .on(TOUCHSTART, function () {
            FeedView.show();
        });

    var addPictureBtn = ui.toPage.find('#add-pictures-btn')
		.on(TOUCHSTART, function () {
			AddPicturesView.show();
		});

    //save pointer to UI elements
    LifeStreamView.ui = ui;
    LifeStreamView.headerEl = ui.toPage.find('#load-view-header');
    LifeStreamView.footerEl = ui.toPage.find('#load-view-footer');
    LifeStreamView.profilePicEl = ui.toPage.find('#profile-pic');

    //display share icon
    ui.toPage.find('#share-moment-icon')
        .css('background-image', 'url(' + Images.getPath() + 'check32.png)')

    //load sample life stream
    var assets = CameraRoll.getCameraRoll();
    var lifeStream = new LifeStream();
    lifeStream.loadSampleData('amine');

    //display user profile thumbnail
    var thumbnailPath = lifeStream.getUserProfileThumbnailPath();
    if (!thumbnailPath)
        throw "user profile thumbnail picture is not initalized";
    ui.toPage.find('#profile-thumbnail')
        .css('background-image', 'url(' + thumbnailPath + ')');

    //load all moments
    var momentsEl = ui.toPage.find('#moments');
    momentsEl.empty();
    for (var idx = 0, moment; moment = lifeStream.moments[idx]; idx++)
        new LifeStreamItem(moment).getEl((idx % 2 == 0)).appendTo(momentsEl);

    //save current view
    localStorage.setItem('current-view', LIFE_STREAM_VIEW_PAGE_IDX);

};