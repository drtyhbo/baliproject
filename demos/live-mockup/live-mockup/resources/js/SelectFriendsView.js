var FriendItem = Class.extend({
    init: function (friend) {
        this.friend = friend;
        this.isSelected = false;
    },

    /**
    * Returns this feed item as a jQuery object that can be inserted into the
    * dom.
    */
    getEl: function (isEven) {
        //top level element
        
        this.el  = $('<div></div>')
                .css({
                    margin: '1px 1px',
                    position: 'relative',
                    height: '55px',
                    clear: 'both',
                    border: '1px solid #eee'
                });
        
        var thumbnailEl = $('<span></span>')
                    .css({
                        backgroundImage: 'url(' + this.friend.thumbnailSrc + ')',
                        backgroundSize: 'cover',
                        borderRadius: '100%',
                        height: '50px',
                        width: '50px',
                        display: 'inline-block',
                        position: 'absolute',
                        top: '0px',
                        left: '5px'
                    }).appendTo(this.el);

        var name = $('<div></div>')
				.css({
				    fontSize: '14px',
				    lineHeight: '14px',
				    position: 'absolute',
				    top: '19px',
				    left: '59px'
		            		    
				})
                .text(this.friend.name)
				.appendTo(this.el);

        this.el.on(TOUCHSTART, this.touchStart.bind(this));
        this.el.on('touchmove', this.touchMove.bind(this));
        this.el.on(TOUCHEND, this.touchEnd.bind(this));

        return this.el;
    },

    touchStart: function (e) {
        this.touchStartY = this.touchEndY = e.originalEvent.pageY;
    },

    touchMove: function (e) {
        this.touchEndY = e.originalEvent.pageY;
    },

    touchEnd: function (shares) {
        if (Math.abs((this.touchEndY || 0) - (this.touchStartY || 0) < 5)) {
            this.isSelected = !this.isSelected;

            if (this.isSelected)
                this.el.css({
                    backgroundColor: '#eee'
                });
            else 
                this.el.css({
                    backgroundColor: '#fff'
                });

        }
    }

});



var SelectFriendsView = {
    headerEl: null,
    profilePicEl: null,
    footerEl: null,
    ui: null,
};

SelectFriendsView.show = function (animate) {
    
    $.mobile.pageContainer.on('pagecontainerbeforetransition',
                            SelectFriendsView.beforeTransition);
    $.mobile.pageContainer.pagecontainer('change', '#select-friends-view', {
        changeHash: false,
        showLoadMsg: false,
        transition: animate ? 'slide' : 'none'
    });
};

SelectFriendsView.beforeTransition = function (event, ui) {
    if (ui.absUrl.indexOf('#select-friends-view') == -1) {
        $.mobile.pageContainer.off('pagecontainerbeforetransition',
                    arguments.callee);
        return;
    }

    if (SelectFriendsView.shown) {
        return;
    }
    SelectFriendsView.shown = true;


    //save pointer to UI elements
    SelectFriendsView.ui = ui;
    SelectFriendsView.headerEl = ui.toPage.find('#load-view-header');
    SelectFriendsView.footerEl = ui.toPage.find('#load-view-footer');
    var friendsEl = SelectFriendsView.ui.toPage.find('#friends');

    //save current view
    localStorage.setItem('current-view', SELECT_FRIEND_VIEW_IDX);

    var friends = Users.getAllUsers();
    for (var i = 0, friend; friend = friends[i]; i++) {
        new FriendItem(friend).getEl().appendTo(friendsEl);
    }



    
};


