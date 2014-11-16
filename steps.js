var run = false;
var player;
var score;
var lines = [];

document.addEventListener("DOMContentLoaded", function(event) {
	Crafty.init(500, 350, 'game');
	Crafty.background('#7f8c8d');
	Crafty.c('Platform', {});
	player = Crafty.e('2D, DOM, Color, Gravity, Twoway, Collision').attr({x: 20, y: 20, w: 25, h: 50}).color('#ecf0f1').gravity('Platform').twoway(2);
	player.steps = 0;
	for (var i = 0; i < 6; i++) {
		routeGen(0);
	}
	score = Crafty.e("2D, DOM, Text").attr({ x: 10, y: 5, w: 500 }).text("Steps taken: " + player.steps).textColor('#2c3e50').textFont('size', '20px');
	registerEvents();
	run = true;
	setInterval(gameCycle, 9);
});

function registerEvents() {

}

function routeGen(step) {
	var xOffset = 0;
	if (lines.length > 0) {
		var lastObj = lines[lines.length - 1];
		xOffset = lastObj.x + lastObj.w;
	}
	lines.push(Crafty.e('2D, DOM, Color, Platform').attr({x: xOffset, y: 250, w: 100, h: 250, step: step}).color('#2c3e50'));	
}

function gameCycle() {
	if (run) {
		for (var i = 0; i < lines.length; i++) {
			lines[i].x--;
			lines[i].y-=0.25;
			if (lines[i].x + lines[i].w < 0) {
				lines[i].destroy();
				lines.splice(i--, 1);
			}
		}
		if (lines.length < 6) {
			routeGen(lines[lines.length - 1].step + 1);
		}
		if (player.y - player.h > 350) {
			player.y = -50;
		}
		if (player.x + player.w > 500) {
			player.x = 500 - player.w;
		}
		else if (player.x < 0) {
			player.x = 0;
		}
		var hitData = player.hit('Platform');
		if (hitData) {
			player.y -= 0.25;
			player.steps = hitData[0].obj.step;
			score.text("Steps taken: " + player.steps)
		}
	}
}