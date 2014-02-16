var LifeStreamMomentViewer = AddPictures.extend({
  init: function(width, scroller, moments) {
    this.moments = moments;
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
    var moment = this.moments[groupIndex];

    var headerEl = $('<div></div>')
        .css({
          fontSize: '11px',
          height: '35px',
          lineHeight: '35px',
          padding: '0 5px'
        })
    // Location
    if (moment.location) {
      $('<span></span>')
          .css('float', 'left')
          .text(moment.location)
          .appendTo(headerEl);
    }
    // Time
    $('<span></span>')
        .css('float', 'right')
        .text(moment.getElapsedTime())
        .appendTo(headerEl);

    return headerEl;
  },
});

var LifeStreamView = {
  pageEl: null,
  headerEl: null,
  profilePicEl: null,
  footerEl: null,
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

  LifeStreamView.headerEl = pageEl.find('#load-view-header');
  LifeStreamView.footerEl = pageEl.find('#load-view-footer');

  pageEl.find('#share-moment-icon')
      .css('background-image', 'url(' + Images.getPath() + 'check32.png)')
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

/*    var shareBtn = LifeStreamView.ui.toPage.find('#share-button')
        .on(TOUCHSTART, function () {
            LifeStreamShareView.show(LifeStreamView.lifeStream, false);
        });*/
};
