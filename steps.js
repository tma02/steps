var run = false;
var player;
var lines = [];
var popups = [];

document.addEventListener("DOMContentLoaded", function(event) {
	Crafty.init(500, 350, 'game');
	Crafty.background('#7f8c8d');
	if (Crafty.storage('steps-ac') === null) {
		Crafty.storage('steps-ac', {
			jump: false,
			getAc: false,
			moveLeft: false,
			moveRight: false,
			sameBlock: false,
			sameBlock8: false,
			differentBlock: false
		});
	}
	if (Crafty.storage('steps-hs') === null) {
		Crafty.storage('steps-hs', 0);
	}
	document.getElementById('hs').innerHTML = 'Highscore: ' + Crafty.storage('steps-hs');
	Crafty.c('Platform', {});
	Crafty.c('WASDTwoway', {
		_speed: 3,
		_up: false,
		init: function () {
			this.requires("Fourway, Keyboard, Gravity");
		},
		twoway: function (speed, jump) {
			this.multiway(speed, {
				D: 0,
				A: 180
			});
			if (speed) this._speed = speed;
			if (arguments.length < 2){
				this._jumpSpeed = this._speed * 2;
			} else{
				this._jumpSpeed = jump;
			}
			this.bind("EnterFrame", function () {
				if (this.disableControls) return;
				if (this._up) {
					this.y -= this._jumpSpeed;
					this._falling = true;
					this.trigger('Moved', { x: this._x, y: this._y + this._jumpSpeed });
				}
			}).bind("KeyDown", function (e) {
				if (!this._falling && e.key === Crafty.keys.W) {
					this._up = true;
					if (!Crafty.storage('steps-ac').jump) {
						Crafty.storage('steps-ac').jump = true;
						popup('');
					}
				}
			});
			return this;
		}
	});
	player = Crafty.e('2D, DOM, Color, Gravity, WASDTwoway, Collision, Keyboard').attr({x: 20, y: 20, w: 25, h: 50}).color('#ecf0f1').gravity('Platform').twoway(2);
	player.steps = 0;
	for (var i = 0; i < 6; i++) {
		routeGen(0);
	}
	registerEvents();
	run = true;
	setInterval(gameCycle, 9);
});

window.addEventListener("keydown", function(e) {
		// space and arrow keys
		if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
				e.preventDefault();
				return false;
		}
}, false);

function registerEvents() {
	player.bind('Moved', function () {
		//clip platforms and viewport
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
		if (hitData && player.steps != 0 && hitData[0].obj.step < player.steps) {
			player.x += 2;
		}
		if (player.y < 0) {
			console.log('You touched the ceiling!');
		}
	});
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
		var hitData = player.hit('Platform');
		if (hitData) {
			player.y -= 0.25;
			if (hitData[hitData.length - 1].obj.step > player.steps) {
				player.steps = hitData[hitData.length - 1].obj.step;
				window.document.title = 'Steps: ' + player.steps;
				document.getElementById('title').innerHTML = 'Steps: ' + player.steps;
				if (player.steps > Crafty.storage('steps-hs')) {
					Crafty.storage('steps-hs', player.steps);
					document.getElementById('hs').innerHTML = 'Highscore: ' + Crafty.storage('steps-hs');
				}
			}
		}
		if (popups.length >= 1) {
			if (popups[0].x > 300 - (popups[0].w / 2)) {
				popups[0].x += 8.5;
			}
			else if (popups[0].x > 200 - (popups[0].w / 2)) {
				popups[0].x += 0.3;
			}
			else {
				popups[0].x += 8.5;
			}
			if (popups[0].x > 500) {
				popups[0].destroy();
				popups.shift();
			}
		}
	}
}

function acPopup() {
	popup();
}

function popup() {
	popups.push(Crafty.e('2D, DOM, Color').attr({x: -100, y: 300, w: 100, h: 25, z: popups.length + 100}).color('#2ecc71'));
}