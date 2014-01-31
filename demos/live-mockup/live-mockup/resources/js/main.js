$(document).ready(function(){
  $(document.body).show();
	setTimeout(function() {
		PersonalLibrary.init();
		if (localStorage.getItem('personal-library') === null) {
			RegistrationAddPicturesPage.show(false);
		} else if (!localStorage.getItem('registration-name')) {
			RegistrationCreateUserPage.show(false);		
		} else {
			FeedView.show(false);
		}
	}, 400);
});
