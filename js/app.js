var player_count = 1;
var mode = "easy"
var max_score = 2;

document.getElementById("usercntbtn").onclick = function() {
	if(document.getElementById("usercntbtn").textContent == "Singleplayer"){
		document.getElementById("usercntbtn").textContent = "Multiplayer";
		document.getElementById("diffbtn").style.visibility = "hidden";
		document.getElementById("diffbtndesc").style.visibility = "hidden";
		player_count = 2;
	}else{
		document.getElementById("usercntbtn").textContent = "Singleplayer";
		document.getElementById("diffbtn").style.visibility = "visible";
		document.getElementById("diffbtndesc").style.visibility = "visible";
		player_count = 1;
	}
};
document.getElementById("diffbtn").onclick = function() {
	if(document.getElementById("diffbtn").textContent == "Easy"){
		document.getElementById("diffbtn").textContent = "Normal";
		mode = "normal";
	}else if(document.getElementById("diffbtn").textContent == "Normal"){
		document.getElementById("diffbtn").textContent = "Hard";
		mode = "hard";
	}else{
		document.getElementById("diffbtn").textContent = "Easy";
		mode = "easy";
	}
};
document.getElementById("scorebtn").onclick = function() {
	if(document.getElementById("scorebtn").textContent < 10){
		document.getElementById("scorebtn").textContent = parseInt(document.getElementById("scorebtn").textContent) + 2;
		max_score += 2;
	}else{
		document.getElementById("scorebtn").textContent = 2;
		max_score = 2;
	}
};
document.getElementById("start").onclick = function() {
	hide_startmenu();
	show_gamemenu();
	game();
};
document.getElementById("Menu").onclick = function() {
	window.location.reload();
};
function hide_startmenu(){
	document.getElementById("title").style.visibility = "hidden";
	document.getElementById("gamemodebtn").style.visibility = "hidden";
	document.getElementById("background").style.visibility = "hidden";
	document.getElementById("diffbtn").style.visibility = "hidden";
	document.getElementById("diffbtndesc").style.visibility = "hidden";
}
function show_gamemenu(){
	document.getElementById("score1").style.visibility = "visible";
	document.getElementById("score2").style.visibility = "visible";
	document.getElementById("Menu").style.visibility = "visible";
}
function game() {

	var camera, controls, scene, ball, ground, renderer, player1, player2, loader;
	var music, win, lose, punch, audioLoader;
	
	var speed_y = 0.03;
	var speed_x = 0.03;
	var ai_speed = 0.045;
	var ai_over = true;

	var ball_size = 0.15
	var player_width = 0.07;
	var player_height = 0.75;
	var ground_width = 5;
	var ground_height = 10;

	var score1 = 0;
	var score2 = 0;

	init();
	animate();

	function init() {
		//preparing the camera
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 6;
		camera.position.y = -2;

		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 0;
		controls.zoomSpeed = 0;
		controls.panSpeed = 0;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.keys = [38, 40, 83, 87];
		controls.addEventListener('change', render);
		
		keys = [];

		//preparing the sound
		var listener = new THREE.AudioListener();
		camera.add(listener);
		music = new THREE.Audio(listener);
		win = new THREE.Audio(listener);
		lose = new THREE.Audio(listener);
		punch = new THREE.Audio(listener);
		audioLoader = new THREE.AudioLoader();
		play_main();

		//preparing the scene
		scene = new THREE.Scene();
		ball = new THREE.Object3D();
		ground = new THREE.Object3D();
		player1 = new THREE.Object3D();
		player2 = new THREE.Object3D();
		scene.add(player1);
		scene.add(player2);
		scene.add(ball);
		scene.add(ground);

		//preparing player's position
		player1.position.x = -4.5;
		player2.position.x = 4.5;

		loader = new THREE.TextureLoader();
		
		//loading ground and ground texture
		loader.load(
			'textures/ice.jpg',
			function (texture) {
				var ice_geometry = new THREE.BoxGeometry(ground_height, ground_width, 0.01);
				var tex_material = new THREE.MeshBasicMaterial( {
					map: texture
				});
				var ice_mesh = new THREE.Mesh( ice_geometry, tex_material );
				ground.add( ice_mesh );
				render();
			}
		);

		//loading blue player and texture
		loader.load(
			'textures/candy_blue.jpg',
			function ( texture ) {
				var player_geometry = new THREE.BoxGeometry( player_width, player_height, 0.1 );
				var tex_material = new THREE.MeshBasicMaterial( {
					map: texture
				});
				var player1_mesh = new THREE.Mesh(player_geometry, tex_material);	
				player1.add(player1_mesh);
				render();
			}
		);
		
		//loading red player and texture
		loader.load(
			'textures/candy_red.jpg',
			function (texture) {
				var player_geometry = new THREE.BoxGeometry( player_width, player_height, 0.1 );
				var tex_material = new THREE.MeshBasicMaterial( {
					map: texture
				} );
				var player2_mesh = new THREE.Mesh(player_geometry, tex_material);	
				player2.add( player2_mesh );
	
				render();
			}
		);

		//loading ball and texture
		loader.load(
			'textures/ball.jpg',
			function (texture) {

				var ball_geometry = new THREE.CylinderGeometry(0.15, 0.15, 0.15, 64);
				var tex_material = new THREE.MeshBasicMaterial( {
					map: texture
				} );
				var ball_mesh = new THREE.Mesh( ball_geometry, tex_material );
				ball_mesh.rotation.x = 1.3;
				ball.add( ball_mesh );
				
				render();
			}
		);

		// renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		window.addEventListener('resize', onWindowResize, false );
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
		controls.handleResize();
		render();
	}

	function animate() {
		requestAnimationFrame(animate);

		//if there was a blow on the border
		if (ball.position.y >= ground_width/2 - ball_size/2 || ball.position.y <= -ground_width/2 + ball_size/2) {
			speed_y = -speed_y;
		};

		//if goal scored
		if (ball.position.x >= ground_width - ball_size/2 || ball.position.x <= -ground_width + ball_size/2) {
			
			//update score
			if (ball.position.x > 0){
				score1++;
				document.getElementById('score1').innerHTML = score1;
			}
			if (ball.position.x < 0) {
				score2++;
				document.getElementById('score2').innerHTML = score2;
			}

			//update speed
			speed_x = 0.03;
			speed_y = 0.03;
			
			//end if max score
			if (score1 == max_score){
				game_over(1);
			}
			if (score2 == max_score){
				game_over(2);
			}

			//random start game
			rand = Math.random();
			if (rand < 0.5){
				speed_x = -speed_x;
			}
			if (rand < 0.25 || rand >= 0.75){
				speed_y = -speed_y;
			}
			//pause after goal
			const date = Date.now();
			let currentDate = null;
			do {
				currentDate = Date.now();
			} while (currentDate - date < 1000);

			//returning positions
			player1.position.y = 0;
			player2.position.y = 0;
			ball.position.x = 0;
			ball.position.y = 0;
			render();
		}

		//collision with the player 1
		if (ball.position.x <= player1.position.x + ball_size/2 + player_width/2 
		&& (ball.position.x >= player1.position.x)
		&& ball.position.y < player1.position.y + player_height/2 + ball_size/2 
		&& ball.position.y > player1.position.y - player_height/2 - ball_size/2){
			speed_x = -speed_x;
			if(mode == "hard"){
				speed_x = speed_x + 0.005;
				speed_y = speed_y + Math.random(-0.1, 0.1)/50;
			}else if(mode == "normal"){
				speed_x = speed_x + 0.002;
				speed_y = speed_y + Math.random(-0.1, 0.1)/50;
			}else{
				speed_x = speed_x + 0.001;
				speed_y = speed_y + Math.random(-0.1, 0.1)/100;
			}
			play_punch();
		}
		
		//collision with the player 2
		if (ball.position.x > player2.position.x - ball_size/2 - player_width/2 
		&& (ball.position.x <= player2.position.x) 
		&& ball.position.y < player2.position.y + player_height/2 + ball_size/2 
		&& ball.position.y > player2.position.y - player_height/2 - ball_size/2){
			speed_x = -speed_x;
			if(mode == "hard"){
				speed_x = speed_x - 0.005;
				speed_y = speed_y - Math.random(-0.1, 0.1)/50;
			}else if(mode == "normal"){
				speed_x = speed_x - 0.002;
				speed_y = speed_y - Math.random(-0.1, 0.1)/50;
			}else{
				speed_x = speed_x - 0.001;
				speed_y = speed_y - Math.random(-0.1, 0.1)/100;
			}
			play_punch();
		}

		//control 1 player
		if (keys[87]){
			if (player1.position.y + player_height/2 < ground_width/2)
				player1.position.y += 0.06;	
		}
		if (keys[83]){
			if (player1.position.y - player_height/2 > -ground_width/2)
				player1.position.y -= 0.06;
		}

		if (player_count == 2)
			//control 2 player
			if (keys[38]){
				if (player2.position.y + player_height/2 < ground_width/2)
					player2.position.y += 0.06;
			}
			if (keys[40]){
				if (player2.position.y - player_height/2 > -ground_width/2)
					player2.position.y -= 0.06;
			}

		if (player_count == 1){
			ai_options();
		}

		//loading speed
		ball.position.x += speed_x;
		ball.position.y += speed_y;
		// Update position of camera
		controls.update();;
		// Render scene
		render();

		document.body.addEventListener("keydown", function (e) {
			keys[e.keyCode] = true;
		});
		document.body.addEventListener("keyup", function (e) {
			keys[e.keyCode] = false;
		});

	}

	

	function ai_options() {
		//chování ai protivníka
		if (mode != "hard"){
			if (ball.position.x <= -1) {
				if (mode == "easy")
					ai_speed = 0;
			}	
			if ((ball.position.x > -1) && (ball.position.x <= 0)) {
				if (mode == "easy")
					ai_speed = 0.014;
				else
					ai_speed = 0.02;
			}
			if ((ball.position.x > 0) && (ball.position.x <= 1)) {
				if (mode == "easy")
					ai_speed = 0.019;
				else
					ai_speed = 0.03;
			}
			if (ball.position.x > 1) {
				if (mode == "easy")
					ai_speed = 0.029;
				else
					ai_speed = 0.04;
			}
		}
		
		if (mode == "hard"){
			if (player2.position.y > ball.position.y)
				ai_over = true;
			if (player2.position.y < ball.position.y)
				ai_over = false;
		}
		else{
			if (player2.position.y + 0.3 > ball.position.y)
				ai_over = true;
		if (player2.position.y - 0.3 < ball.position.y)
			ai_over = false;
		}


		if (!ai_over && (player2.position.y + player_height/2 < ground_width/2)){
			player2.position.y += ai_speed;
		}
		else if (ai_over && (player2.position.y - player_height/2 > -ground_width/2)){
			player2.position.y -= ai_speed;
		}


	}

	function render() {
		renderer.render( scene, camera );
	}

	
	
	async function game_over(winner){
		score1 = 0;
		score2 = 0;
		document.getElementById('score1').innerHTML = score1;
		document.getElementById('score2').innerHTML = score2;
		if (player_count == 2){
			document.getElementById('gameStat').innerHTML = "Player "+ winner + " The Winner!";
			if (winner == 1){
				document.getElementById('gameStat').style.color = "blue";
				play_win();
			}else{
				document.getElementById('gameStat').style.color = "red";
				play_win();
			}
		}else{
			if (winner == 1) {
				document.getElementById('gameStat').style.color = "blue";
				document.getElementById('gameStat').innerHTML = "You Win!";
				play_win();
			}
			else {
				document.getElementById('gameStat').style.color = "red";
				document.getElementById('gameStat').innerHTML = "You Lose!";
				play_lose();
			}
		}
		setTimeout(function(){document.getElementById('gameStat').innerHTML = " "}, 2500);
	}

	function play_main(){
		audioLoader.load('sounds/main.mp3', function(buffer) {
				music.setBuffer(buffer);
				music.setLoop(true);
				music.setVolume(0.2);
				music.play();
            }
		);
	}
	
	function play_win(){
		audioLoader.load('sounds/win.mp3', function(buffer) {
				win.setBuffer(buffer);
				win.setLoop(false);
				win.setVolume(2);
				win.play();
            }
		);
	}
	function play_lose(){
		audioLoader.load('sounds/lose.mp3', function(buffer) {
				lose.setBuffer(buffer);
				lose.setLoop(false);
				lose.setVolume(2);
				lose.play();
            }
		);
	}
	function play_punch(){
		audioLoader.load('sounds/punch.mp3', function(buffer) {
				punch.setBuffer(buffer);
				punch.setLoop(false);
				punch.setVolume(2);
				punch.play();
            }
		);
	}
};