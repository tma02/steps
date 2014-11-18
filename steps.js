var acInfo = {
	jump: {
		title: 'Jump',
		desc: 'It can only get easier, right?'
	}, 
	getAc: {
		title: 'Achievement Get',
		desc: 'Another one for the display.'
	},
	moveLeft: {
		title: 'Move Left',
		desc: 'To the left, to the left.'
	},
	moveRight: {
		title: 'Move Right',
		desc: 'DDDDDDDDDDDDD'
	},
	sameBlock: {
		title: 'The Same Step',
		desc: 'Seems a little counter-productive.'
	},
	sameBlock8: {
		title: '8 Ball',
		desc: 'Ask again later.'
	},
	differentBlock: {
		title: 'A New Step',
		desc: 'Finally, a change in scenery. Oh wait.'
	},
	touchCeil: {
		title: 'Raise the Roof',
		desc: 'Touch the ceiling.'
	},
	step500: {
		title: 'Having Fun?',
		desc: 'Take 500 steps.'
	},
	step1000: {
		title: '0x03E8',
		desc: 'That\'s a lot of steps.'
	},
	step2000: {
		title: 'Snooze',
		desc: 'Are you still awake?'
	}
}

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
			differentBlock: false,
			touchCeil: false,
			step500: false,
			step1000: false,
			step2000: false
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
						acGet('jump');
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
			if (popups[0].bg.x > 300 - (popups[0].bg.w / 2)) {
				popups[0].bg.x += 8.5;
			}
			else if (popups[0].bg.x > 200 - (popups[0].bg.w / 2)) {
				popups[0].bg.x += 0.3;
			}
			else {
				popups[0].bg.x += 8.5;
			}
			popups[0].text.x = popups[0].bg.x;
			if (popups[0].bg.x > 500) {
				popups[0].bg.destroy();
				popups[0].text.destroy();
				popups.shift();
			}
		}
	}
}

function acGet(name) {
	if (acInfo[name] !== null) {
		var infoObj = acInfo[name];
		var saveObj = Crafty.storage('steps-ac');
		saveObj[name] = true;
		Crafty.storage('steps-ac', saveObj);
		acPopup(infoObj);
	}
	else {
		console.log('Tried to get invalid achievement: ' + name);
	}
}

function acPopup(infoObj) {
	popup('Achievement Unlocked<br/>' + infoObj.title + '<br/>' + infoObj.desc);
}

function popup(text) {
	popups.push({
		bg: Crafty.e('2D, DOM, Color').attr({x: -100, y: 275, w: 200, h: 50, z: popups.length * 2 + 100}).color('#2ecc71'),
		text: Crafty.e("2D, DOM, Text").attr({x: -100, y: 275, w: 200, h: 50, z: popups.length * 2 + 101}).text(text).textFont('size', '12px').textColor('#eeeeee')
	});
}