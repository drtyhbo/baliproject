$(document).ready(function(){
  $(document.body).show();
	setTimeout(function() {
		if (!localStorage.getItem('registration-pictures')) {
			RegistrationAddPicturesPage.show(false);
		} else if (!localStorage.getItem('registration-name')) {
			RegistrationCreateUserPage.show(false);		
		} else {
			FeedView.show(false);
		}
	}, 400);
});
