var LifeStreamMomentViewer = AddPictures.extend({
  init: function(width, scroller, moments) {
    this.moments = moments;
    this.headerEls = [];
    this.infoLineEls = [];
    this.checkMarkEls = [];
    this._super(width, scroller, true);
  },
 
 /**************************
  *
  * AddPictures overrides
  *
  **************************/
 
  getNumGroups: function() {
    return this.moments.length;
  },

  getAssetsForGroup: function(groupIndex) {
    return this.moments[groupIndex].widgets;
  },
 
  getGroupHeaderEl: function(groupIndex) {
    if (this.headerEls[groupIndex]) {
      return this.headerEls[groupIndex];
    }

    var moment = this.moments[groupIndex];

    var headerEl = $('<div></div>')
        .css({
          fontSize: '11px',
          height: '35px',
          padding: '0 5px'
        })
    this.headerEls[groupIndex] = headerEl;

    var infoLineEl = $('<div></div>')
        .css('line-height', '35px')
        .appendTo(headerEl);
    this.infoLineEls[groupIndex] = infoLineEl;
    // Location
    if (moment.location) {
      $('<span></span>')
          .css('float', 'left')
          .text(moment.location)
          .appendTo(infoLineEl);
    }
    // Time
    $('<span></span>')
        .css('float', 'right')
        .text(moment.getElapsedTime())
        .appendTo(infoLineEl);
        
    var checkMarkEl = $('<div></div>')
        .css({
          backgroundImage: 'url(' + Images.getPath() + 'check-24.png' + ')',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          cursor: 'pointer',
          display: 'none',
          float: 'right',
          height: '32px',
          marginTop: '2px',
          width: '32px'
        })
        .on(TOUCHSTART, this.toggleSelectGroup.bind(this, groupIndex))
        .appendTo(headerEl);
    this.checkMarkEls[groupIndex] = checkMarkEl;

    return headerEl;
  },
  
  setSelectable: function (isSelectable, showSelectAll,
      selectionChangedCallback) {
    this._super(isSelectable, showSelectAll, selectionChangedCallback);

    for (var i = 0; i < this.headerEls.length; i++) {
      if (!this.headerEls[i]) {
        continue;
      }
      this.infoLineEls[i].css('display', isSelectable ? 'none' : 'block');
      this.checkMarkEls[i].css('display', isSelectable ? 'block' : 'none');
    }
  }
});

var LifeStreamView = {
  pageEl: null,
  momentViewer: null
};

/**
 * Makes the life stream view the current view.
 */
LifeStreamView.show = function (animate) {
  $.mobile.pageContainer.on('pagecontainershow', LifeStreamView.onShow);
  $.mobile.pageContainer.pagecontainer('change', '#life-stream-load-view', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

/**
 * Event handler. Called once the LifeStreamView is made visible.
 */
LifeStreamView.onShow = function(event) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);

  if (LifeStreamView.shown) {
    return;
  }
  LifeStreamView.shown = true;

  var pageEl = $('#life-stream-load-view');
  LifeStreamView.pageEl = pageEl;

  var homeBtn = pageEl.find('#home-btn')
      .on(TOUCHSTART, function () {
        FeedView.show();
      });
  var addPictureBtn = pageEl.find('#add-pictures-btn')
    	.on(TOUCHSTART, function () {
        AddPicturesView.show();
    	});
      
  var shareMode = false;
  var topShareBtn = pageEl.find('#top-share-btn')
      .on(TOUCHSTART, function() {
        shareMode = !shareMode;
        pageEl.find('#navbar')[shareMode ? 'hide' : 'show']();
        bottomShareBtn[shareMode ? 'show' : 'hide']();
        topShareBtn.text(shareMode ? 'Cancel' : 'Share');
        LifeStreamView.momentViewer.setSelectable(shareMode, false,
            LifeStreamView.onSelectionChanged);
      });
  var bottomShareBtn = pageEl.find('#bottom-share-btn')
      .on(TOUCHSTART, function() {
        SelectFriendsView.show(false);
      });

  pageEl.find('#lifestream-user-name')
      .text(Users.getCurrentUser().firstName);

  if (!LifeStreamView.lifeStream) {
    Moments.ajaxGetAll(LifeStreamView.loadMoments);
  } else {
    LifeStreamView.loadMoments(LifeStreamView.lifeStream.moments);
  }

  localStorage.setItem('current-view', LIFE_STREAM_VIEW_PAGE_IDX);
};


LifeStreamView.loadMoments = function (moments) {
  var scroller = new Scroller(LifeStreamView.pageEl.find('#scrollable'));
  var momentViewer =
      new LifeStreamMomentViewer(LifeStreamView.pageEl.width(), scroller,
          moments);
  momentViewer.getEl()
      .appendTo(LifeStreamView.pageEl.find('#picture-viewer'));
  LifeStreamView.momentViewer = momentViewer;
};

LifeStreamView.onSelectionChanged = function(numSelected) {
  LifeStreamView.pageEl.find('#bottom-share-btn')
      .text(!numSelected ? 'Share' : 'Share ' + numSelected);
};
