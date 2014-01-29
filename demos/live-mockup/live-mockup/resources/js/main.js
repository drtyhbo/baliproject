setTimeout(function () {
    $(document).ready(function () {
        $(document.body).show();

/*	localStorage.setItem('initialized', 0);
	if (!localStorage.getItem('initialized') ||
      localStorage.getItem('initialized') < 2) {
		setTimeout(function() {
			if (localStorage.getItem('initialized') == 1) {
				RegistrationCreateUserPage.show(false);
			} else {
				RegistrationAddPicturesPage.show(false);
			}
		}, 100);*/
    setTimeout(function(){
			FeedView.show();
    },500);
/*	} else {
    $.mobile.pageContainer.pagecontainer('change', 'user-profile.html');
	}*/
});
