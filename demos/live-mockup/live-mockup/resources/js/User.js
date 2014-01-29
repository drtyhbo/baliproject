var User = Class.extend({
	init: function (name, email, thumbnailSrc) {
    this.name = name || null;
    this.email = email || null;
		this.thumbnailSrc = thumbnailSrc || null;
  }
});

var Users = {
	users: []
};

Users.init = function() {
	this.users.push(
			new User('Amine Zejli', 'amine@zejli.com',
							 Images.getPath('users/amine.jpg')));
 	this.users.push(
 			new User('Marcello Chermak', 'marcello@chermak.com',
 							 Images.getPath('users/marcello.jpg')));
}
