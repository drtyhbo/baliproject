var FEED_VIEW_PAGE_IDX = 0;
var ADD_PICTURES_VIEW_PAGE_IDX = 1;
var LIFE_STREAM_VIEW_PAGE_IDX = 2;

$(document).ready(function () {
  $(document.body).show();
	setTimeout(function() {
		PersonalLibrary.init();
		if (localStorage.getItem('personal-library') === null) {
			RegistrationAddPicturesPage.show(false);
		} else if (!localStorage.getItem('registration-name')) {
			RegistrationCreateUserPage.show(false);		
		} else {
		    if (localStorage.getItem('current-view') == ADD_PICTURES_VIEW_PAGE_IDX)
		        AddPicturesView.show(false);
		    else if (localStorage.getItem('current-view') == LIFE_STREAM_VIEW_PAGE_IDX)
		        LifeStreamView.show(false);
            else
			    FeedView.show(false);
		}
	}, 400);
});
