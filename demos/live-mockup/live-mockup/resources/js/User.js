var User = Class.extend({
	init: function (name, username, thumbnailSrc) {
    this.name = name || null;
    this.username = username || null;
		this.thumbnailSrc = thumbnailSrc || null;
  }
});

var Users = {
	users: {}
};

Users.users['amine'] = new User('Amine Zejli', 'amine',
		Images.getPath('users/') + 'amine.jpg');
Users.users['marcello'] = new User('Marcello Chermak', 'marcello',
 		Images.getPath('users/') + 'marcello.jpg');

Users.getUser = function(username) {
	return Users.users[username];
};