var AssetViewer = AddPictures.extend({
  init: function (width, scroller, assets) {
    this.assets = assets;
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

  getNumGroups: function () {
    return 1;
  },

  getAssetsForGroup: function (groupIndex) {
    return this.assets;
  },

  getGroupHeaderEl: function (groupIndex) {
    if (this.headerEls[groupIndex]) {
      return this.headerEls[groupIndex];
    }


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

var ReshareView = {
  pageEl: null,
  momentViewer: null,
  assets: null

};

ReshareView.show = function (animate, assets) {
  ReshareView.assets = assets;
  $.mobile.pageContainer.on('pagecontainershow', ReshareView.onShow);
  $.mobile.pageContainer.pagecontainer('change', '#reshare-view', {
    changeHash: false,
    showLoadMsg: false,
    transition: animate ? 'slide' : 'none'
  });
};

ReshareView.onShow = function (event) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);


  var pageEl = $('#reshare-view');
  ReshareView.pageEl = pageEl;

  //wire up buttons
  var bottomShareBtn = pageEl.find('#bottom-share-btn')
            .off(TOUCHSTART);
  bottomShareBtn.on(TOUCHSTART, function () {
    var selectedAssetIds = [];
    var selectedAssets = ReshareView.assetViewer.getSelected();
    for (var i = 0, asset; asset = selectedAssets[i]; i++)
      selectedAssetIds.push(asset.id);

    SelectFriendsView.show(false, selectedAssetIds);
  });

  var backBatn = pageEl.find('#top-share-btn')
            .off(TOUCHSTART);
  backBatn.on(TOUCHSTART, function () {
    FeedView.show(false, null, false);
  });

  //set name header
  pageEl.find('#reshare-user-name')
      .text(Users.getCurrentUser().firstName);

  //clear page
  ReshareView.pageEl.find('#picture-viewer').empty();

  //load asset viewer
  var scroller = new Scroller(pageEl.find('#scrollable'));
  var assetViewer =
      new AssetViewer(ReshareView.pageEl.width(), scroller,
          ReshareView.assets);

  assetViewer.getEl()
      .appendTo(ReshareView.pageEl.find('#picture-viewer'));
  ReshareView.assetViewer = assetViewer;
  ReshareView.assetViewer.setSelectable(true, false,
            ReshareView.onSelectionChanged);
  ReshareView.assetViewer.toggleSelectAllGroups();


  //localStorage.setItem('current-view', LIFE_STREAM_VIEW_PAGE_IDX);
};

ReshareView.onSelectionChanged = function (numSelected) {
  ReshareView.pageEl.find('#bottom-share-btn')
      .text(!numSelected ? 'Share' : 'Share ' + numSelected);
};
