var LifeStreamItem = Class.extend({
    init: function (moment) {
        this.moment = moment;
    },

    /**
    * Returns this feed item as a jQuery object that can be inserted into the
    * dom.
    */
    getEl: function () {

        var time = '7m';
        var thumbnailSrc1 = 'img/camera/IMG_0183_thumb.jpg';
        var thumbnailSrc2 = 'img/camera/IMG_0155_thumb.jpg';


        this.el = $('<div></div>')
				.css({
				    marginBottom: '10px',
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
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'relative',
				    float: 'right'
				})
				.text(this.moment.getElapsedTime())
				.appendTo(locationTimeContainerEl);

        //generate thumbnails
        var tumbnailContainerEl = $('<div></div>')
           .css({
               padding:'3px',
               height: '42px',
               position: 'relative',
               clear: 'left',
               background: '#eee'
           })
           .appendTo(headerEl);

        var thumbnailEl1 = $('<span></span>')
            .css({
                backgroundImage: 'url(' + thumbnailSrc1 + ')',
                backgroundSize: 'cover',
                borderRadius: '100%',
                height: '32px',
                width: '32px',
                display: 'inline-block',
                position:'relative',
                float: 'left',
                marginRight: '3px'
            })
            .appendTo(tumbnailContainerEl);

        var thumbnailEl2 = $('<span></span>')
            .css({
                backgroundImage: 'url(' + thumbnailSrc2 + ')',
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

        //generate pictures
            


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
    lifeStream.loadSampleData(
        'amine zejli',
        'zejli.amine@gmail.com',
        assets[0].getSrc(),
        assets[0].getThumbSrc());

    //display user profile thumbnail
    var thumbnailPath = lifeStream.getUserProfileThumbnailPath();
    if (!thumbnailPath)
        throw "user profile thumbnail picture is not initalized";
    ui.toPage.find('#profile-thumbnail')
        .css('background-image', 'url(' + thumbnailPath + ')');

    //load all moments
    var momentsEl = ui.toPage.find('#moments');
    momentsEl.empty();
    for (var idx = 0; idx < lifeStream.moments.length; idx++)
        new LifeStreamItem(lifeStream.moments[idx]).getEl().appendTo(momentsEl);

    //save current view
    localStorage.setItem('current-view', LIFE_STREAM_VIEW_PAGE_IDX);

};