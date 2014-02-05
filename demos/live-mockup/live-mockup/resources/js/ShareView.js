var ShareViewItem = Class.extend({
    init: function (share) {
        this.share= share;
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

        //generate share with & time
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
				    float: 'left'
				})
				.text('shared with')
				.appendTo(locationTimeContainerEl);
        var timeEl = $('<div></div>')
				.css({
				    paddingRight: '4px',
				    fontSize: '11px',
				    lineHeight: '11px',
				    position: 'relative',
				    float: 'right'
				})
				.text(this.share.getElapsedTime())
				.appendTo(locationTimeContainerEl);

        //generate user thumbnails
        var users = this.share.getSharedWithUsers();
        if (users && users.length > 1) {
            var tumbnailContainerEl = $('<div></div>')
               .css({
                   padding: '4px 0px 0px 4px',
                   height: '32px',
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
        var addPictures = new AddPictures(ShareView.ui.toPage.width(), false, false, null, this.share.getWidgets());
        addPictures.getEl()
              .appendTo(pictureContainerEl);

        //contruct comment link
        /*var numComments = this.moment.getCommentCount();
        var numShares = this.moment.getShareCount();
        var linkTxt = '';
        if (numComments > 1)
            linkTxt = numComments + ' comments ';
        else if (numComments > 0)
            linkTxt = numComments + ' comment ';
        if (numComments > 0 && numShares > 1)
            linkTxt += 'in ' + numShares + ' shares';
        else if (numComments > 0 && numShares > 0)
            linkTxt += 'in ' + numShares + ' share';

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
                .text(linkTxt)
                .appendTo(commentsLinkContainerEl);

        commentsLinkContainerEl.on(TOUCHSTART, this.touchStart.bind(this));
        commentsLinkContainerEl.on('touchmove', this.touchMove.bind(this));
        commentsLinkContainerEl.on(TOUCHEND, this.touchEnd.bind(this, this.moment.getMomentShares()));*/

        return this.el;
    },

    touchStart: function (e) {
        this.touchStartY = this.touchEndY = e.originalEvent.pageY;
    },

    touchMove: function (e) {
        this.touchEndY = e.originalEvent.pageY;
    },

    touchEnd: function (shares) {
        if (Math.abs(this.touchEndY - this.touchStartY) < 5) {
            if (this.onSelectionChanged) {
                ShareView.show(false);
            }
        }
    }

});



var ShareView = {
    headerEl: null,
    footerEl: null,
    ui: null,
    shares: null
};

ShareView.show = function (shares, animate) {
    ShareView.shares = shares;
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
                            ShareView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#share-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

ShareView.beforeTransition = function (event, ui) {
    if (ui.absUrl.indexOf('#share-view') == -1) {
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
    ShareView.ui = ui;
    ShareView.headerEl = ui.toPage.find('#load-view-header');
    ShareView.footerEl = ui.toPage.find('#load-view-footer');


    //load all moments
    var sharesEl = ui.toPage.find('#shares');
    sharesEl.empty();
    for (var idx = 0, share; share = ShareView.shares[idx]; idx++)
        new ShareViewItem(share).getEl((idx % 2 == 0)).appendTo(sharesEl);

    //save current view
    localStorage.setItem('current-view', SHARE_VIEW_PAGE_IDX);
    localStorage.setItem('loaded-share-ids', Shares.getIds(ShareView.shares))
};
