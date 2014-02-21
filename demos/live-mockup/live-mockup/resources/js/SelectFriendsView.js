var FriendItem = Class.extend({
  init: function (friend, onSelectionCallback) {
    this.friend = friend;
    this.isSelected = false;
    this.onSelectionCallback = onSelectionCallback || null;
  },

  /**
  * Returns this feed item as a jQuery object that can be inserted into the
  * dom.
  */
  getEl: function (isEven) {
    //top level element

    this.el = $('<div></div>')
            .css({
              position: 'relative',
              height: '62px',
              clear: 'both',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: '#eee'
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
                  top: '5px',
                  left: '5px'
                }).appendTo(this.el);

    var name = $('<div></div>')
    .css({
      fontSize: '14px',
      lineHeight: '14px',
      position: 'absolute',
      top: '22px',
      left: '61px'

    })
            .text(this.friend.name)
    .appendTo(this.el);

    this.selectedEl = $('<span></span>')
                .css({
                  backgroundImage: 'url(' + Images.getPath() + 'check-24.png' + ')',
                  backgroundRepeat: 'no-repeat',
                  cursor: 'pointer',
                  display: 'inline-block',
                  position: 'absolute',
                  display: 'none',
                  height: '32px',
                  width: '32px',
                  marginTop: '10px',
                  right: '5px',
                  top: '6px'
                }).appendTo(this.el);

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
        this.selectedEl.show();
      else
        this.selectedEl.hide();

      if (this.onSelectionCallback)
        this.onSelectionCallback();
    }
  }

});



var SelectFriendsView = {
  headerEl: null,
  profilePicEl: null,
  footerEl: null,
  ui: null,
};

SelectFriendsView.show = function (animate, assetIds) {
  SelectFriendsView.assetIds = assetIds;
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

  //wire buttons
  var backBtn = SelectFriendsView.ui.toPage.find('#back-button')
      .on(TOUCHSTART, function () {
        LifeStreamView.show(SelectFriendsView.lifeStream, false);
      });

  var shareBtn = SelectFriendsView.ui.toPage.find('#share-btn')
      .on(TOUCHSTART, function () {
        SelectFriendsView.createShare();
      });

  var friends = Users.getFriends();
  SelectFriendsView.items = [];
  for (var i = 0, friend; friend = friends[i]; i++) {
    var item = new FriendItem(friend, SelectFriendsView.friendSelectionChanged.bind(SelectFriendsView));
    item.getEl().appendTo(friendsEl);
    SelectFriendsView.items.push(item);
  }
};

SelectFriendsView.friendSelectionChanged = function () {
  var count = 0;
  for (var i = 0, item; item = SelectFriendsView.items[i]; i++) {
    count += item.isSelected ? 1 : 0;
  }

  var shareBtn = SelectFriendsView.ui.toPage.find('#share-btn')
      .text(count == 0 ? 'Share' : 'Share with ' + count);
}

SelectFriendsView.createShare = function () {
  //get selected friend ids
  var friendIds = [];
  for (var i = 0, item; item = SelectFriendsView.items[i]; i++) {
    if (item.isSelected)
      friendIds.push(item.friend.id);
  }

  //save share
  Shares.ajaxCreateShare(SelectFriendsView.assetIds, friendIds, SelectFriendsView.createShareCallback.bind(SelectFriendsView))
}

SelectFriendsView.createShareCallback = function (newShareId) {
  if (newShareId)
    FeedView.show(false, newShareId, true);
  else
    Util.alert("oops, couldn't share. please try again!");


}
