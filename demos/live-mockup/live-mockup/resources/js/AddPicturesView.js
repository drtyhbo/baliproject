var AddPicturesView = {
    addPictures: null,
    pageEl: null,
    shown: false
};

/**
 * Makes the add pictures registration page the current page.
 */
AddPicturesView.show = function () {
  $.mobile.pageContainer.on('pagecontainershow',
      AddPicturesView.onShow);
  $.mobile.pageContainer.pagecontainer('change', '#add-pictures-view', {
    changeHash: false,
    showLoadMsg: false,
    transition: 'none'
  });
};

/**
 * Event handler. Called once the AddPicturesView is made visible.
 */
AddPicturesView.onShow = function (event, ui) {
  $.mobile.pageContainer.off('pagecontainershow', arguments.callee);

  if (AddPicturesView.shown) {
      return;
  }
  AddPicturesView.shown = true;

  var pageEl = $('#add-pictures-view');
  
  AddPicturesView.pageEl = pageEl;
  var homeBtn = pageEl.find('#home-btn')
			.on(TOUCHSTART, function () {
		    FeedView.show();
			});
  var viewProfileBtn = pageEl.find('#profile-btn')
			.on(TOUCHSTART, function () {
		    LifeStreamView.show();
			});

  var headerEl = pageEl.find('#header');
  $('<img></img>')
  		.css({
  	    left: '5px',
  	    position: 'absolute',
  	    top: '5px'
  		})
  		.attr({
  	    height: 32,
  	    src: Images.getPath('icons/') + 'camera.png',
  	    width: 32
  		})
  		.appendTo(headerEl);

  AddPicturesView.addEl = pageEl.find('#add-button')
  		.on(TOUCHEND, AddPicturesView.onAddPictures);

  var assets = CameraRoll.getCameraRoll().filter(function(asset) {
    return !PictureWidgets.getPictureByAssetId(asset.id);
  });

  var scroller = new Scroller(pageEl.find('#scrollable'));
  var addPictures =
      new AddPictures(pageEl.width(), assets, scroller);
  addPictures.setSelectable(true, false, AddPicturesView.onSelectionChanged);
  addPictures.getEl()
      .appendTo(pageEl.find('#pictures'));
  AddPicturesView.addPictures = addPictures;

  if (assets.length) {
    AddPicturesView.addPictures.toggleSelectAll();
  } else {
    AddPicturesView.showEmptyUi();
  }

  localStorage.setItem('current-view', ADD_PICTURES_VIEW_PAGE_IDX);
};

/**
 * Creates and returns a UI that can be shown when there are no photos left.
 */
AddPicturesView.showEmptyUi = function (e) {
  var emptyUiContainer = $('<div></div>')
      .css({
        color: '#ccc',
        fontSize: '20px',
        left: 0,
        marginTop: '-57px',
        position: 'absolute',
        right: 0,
        textAlign: 'center',
        top: '50%'
      })
      .appendTo(AddPicturesView.pageEl);
  $('<div></div>')
      .text('All photos added!')
      .appendTo(emptyUiContainer);
  $('<img></img>')
  		.attr({
  	    height: 64,
  	    src: Images.getPath('icons/') + 'camera-64.png',
  	    width: 64
  		})
		.appendTo(emptyUiContainer);
  $('<div></div>')
      .text('Take a new one :)')
      .appendTo(emptyUiContainer);
};


/**
 * Event handler. Called when the user clicks the 'Add' button.
 */
AddPicturesView.onAddPictures = function (e) {
  var assets = AddPicturesView.addPictures.getSelected();

  // "Upload" those pictures which are selected.
  PersonalLibrary.add(assets);
  PictureWidgets.ajaxAdd(assets);

  AddPicturesView.addPictures.removeSelected(function () {
    AddPicturesView.onSelectionChanged(0);
    if (!AddPicturesView.addPictures.getNumPictures()) {
      AddPicturesView.showEmptyUi();
    }
  });
};

/**
 * Event handler. Called when the user selects new pictures.
 */
AddPicturesView.onSelectionChanged = function (numSelected) {
  if (numSelected == 0) {
    AddPicturesView.addEl.text('Add');
  } else {
    AddPicturesView.addEl.text('Add ' + numSelected);
  }
};