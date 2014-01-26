function callAlert() {
	alert ('called');
}

function start(assets) {
	for (var i = 0, asset; asset = assets[i]; i++) {
//		console.log(asset.date + ' ' + asset.location + ' ' + asset.path);
		var div = document.createElement('div');
		div.style.width = '200px';
		div.style.height = '200px';
		div.style.backgroundImage = 'url(data:image/jpeg;base64,' + asset.thumbnail + ')';
		document.body.appendChild(div);
	}
}