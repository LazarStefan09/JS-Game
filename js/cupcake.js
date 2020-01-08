	var ctx = document.getElementById('ctx').getContext('2d');
		var catcherOne = new Image();
		var catcherTwo = new Image();
		var catcherThree = new Image();
		var catcherFour = new Image();
		var background = new Image();
		var blood = new Image();
		var tile = new Image();
		var food = new Image();
		var fruit = new Image();

		// Global Variables
		var score = 0;
		var level = 100;
		var animation = 0;
		var foodTimer = 0;
		var fruitTimer = 0;
		var gameover = false;
		var intervalVar;
		var paused;
		var foodList = [];
		var tileList = [];
		var fruitList = [];
		var foodDrop = [0,50,100,150,200,250,300,350,400,450]; //Positions from where the food can drop

		var tileObject = {
			'height':20,
			'width':50
		};

		var catcher = {
			'x':100,
			'y':350,
			'width':30,
			'height':50,
			'jump':0, // How many pixels will it go up?
			'onair':false, // Whether the catcher is already in the air
			'jumpUnit':5, // Go up or down per frame
			'spd':0,
			'leftPressed':false,
			'rightPressed':false,
			'gravity':10,
			'safe':true
		};

		var foodObject = {
			'height':50,
			'width':50,
			'spd':3
		};
		
		
		var fruitObject = {
			'height':40,
			'width':40,
			'spd':3
		};

		var sound = function(src) {
			this.sound = document.createElement("audio");
			this.sound.src = src;
			this.sound.setAttribute("preload", "auto");
			this.sound.setAttribute("controls", "none");
			this.sound.style.display = "none";
			document.body.appendChild(this.sound);
			this.play = function(){
				this.sound.play();
			};
			this.stop = function(){
			    this.sound.pause();
			};
		};

      	var eatingSound = new sound("sound/eat.mp3");
    	var droppingSound = new sound("sound/drop.mp3");

		background.onload = function(){
			blood.onload = function() {
				catcherOne.onload = function() {
					catcherTwo.onload = function() {
						catcherThree.onload = function() {
							catcherFour.onload = function() {
								food.onload = function() {
									tile.onload = function() {
										fruit.onload = function() {

											ctx.drawImage(background,0,0,500,500);
											ctx.strokeStyle = "#FFFFFF";
											ctx.font = "30px Calibri";
											ctx.strokeText("Click here to start the game",80,250);

											var drawObject = function(object,x,y,width,height) {
												ctx.drawImage(object,x,y,width,height);
											};

											document.getElementById('ctx').onmousedown = function() {
												if (!gameover) {
													clearInterval(intervalVar);
												}
												startGame();
											};//Click to start or restart


											document.onkeydown = function(event) {
												if (event.keyCode == 37 && catcher.x > 0) {
													catcher.spd = -5;
													catcher.leftPressed = true;
												}
												if (event.keyCode == 39 && catcher.x < 500 - catcher.width) {
													catcher.spd = 5;
													catcher.rightPressed = true;
												}
												if (event.keyCode == 38 && !catcher.onair && catcher.y== 350) {
													if (!catcher.onair) {
														catcher.jump = 100;
														catcher.onair = true;
													}
												}
												if (event.keyCode == 32) {
													if (paused)
														paused = false;
													else
														paused = true;
												}
											};//Asigns attributes for keys when pressed

											document.onkeyup = function(event) {
												if (event.keyCode == 37) {
													catcher.leftPressed = false;
												}
												if (event.keyCode == 39) {
													catcher.rightPressed = false;
												}
											};//When keys are released

											var food_catcher_collision = function(f) {
												return ((f.x < catcher.x + catcher.width) &&
														(catcher.x < f.x + foodObject.width) &&
														(f.y < catcher.y + catcher.height) &&
														(catcher.y < f.y + foodObject.height));
											};//Collision between food and catcher

											var food_tile_collision = function(f,t) {
												return ((f.x < t.x + tileObject.width) &&
														(t.x < f.x + foodObject.width) &&
														(f.y < t.y + tileObject.height) &&
														(t.y < f.y + foodObject.height));	
											};//Collision between food and tile
											
											var fruit_catcher_collision = function(f) {
												return ((f.x < catcher.x + catcher.width) &&
													(catcher.x < f.x + fruitObject.width) &&
													(f.y < catcher.y + catcher.height) &&
													(catcher.y < f.y + fruitObject.height));
											};//Collision between fruit and catcher

											var catcher_tile_collision = function(t) {
												return ((catcher.x <= t.x + tileObject.width) &&
														(t.x <= catcher.x + catcher.width) &&
														(catcher.y + catcher.height <= t.y));
											};//Collision between catcher and tile


											var jump = function() {
												// Moving up
												if (catcher.jump > 0 && catcher.onair) {
													catcher.y -= catcher.jumpUnit;
													catcher.jump -= catcher.jumpUnit;
												}
												if (catcher.jump <= 0 && catcher.jump > -100 && catcher.onair) {
													catcher.y += catcher.jumpUnit;
													catcher.jump -= catcher.jumpUnit;
												}
												if (catcher.jump <= -100 && catcher.onair) {
													catcher.onair = false;
												}
											};//Making the catcher jump

											var updateFoodPosition = function() {
												for(var i in foodList) {
													if (foodList[i].y > 500) { 
														foodList.splice(i,1);//Deletes elements from the list, i is the index of the element and 1 is the number of the elements that you delete
													}
													else {
														foodList[i].y += foodObject.spd;
													}
												}
											};//Allowing the food to drop 
											
											var updateFruitPosition = function() {
												for(var i in fruitList) {
													if (fruitList[i].y > 500) { 
														fruitList.splice(i,1);
													}
													else {
														fruitList[i].y += fruitObject.spd;
													}
												}
											};//Allowing the fruit to drop

											var updateCatcherPosition = function() {
												if (catcher.leftPressed && catcher.x > 0) {
													catcher.x += catcher.spd;
												}//Catcher moves to left
												if (catcher.rightPressed && catcher.x < 500 - catcher.width) {
													catcher.x += catcher.spd;	
												}//Catcher moves to right
												if (catcher.y > 450) {
													gameover = true;
													catcher.y = 450;
													droppingSound.play();
												}//Stopping the catcher from falling at the end of the canvas instead of falling out of it
											};//Manipulates the catcher

											var gameOver = function() {
												ctx.save();
												ctx.globalAlpha = 0.6;//Setting the opacity to 0.6, the default is 1.0
												drawObject(blood,100,100,300,300);
												ctx.globalAlpha = 1.0;
												ctx.strokeStyle = "#FFFFFF";
												ctx.font = "30px Calibri";
												ctx.strokeText("Game Over",180,200);
												ctx.strokeText("Click to restart",160,250);
												ctx.restore();
												clearInterval(intervalVar);
											};

											var updatePosition = function() {
												if (!paused) {
													ctx.clearRect(0,0,500,500);
													ctx.drawImage(background,0,0,500,500);
													foodTimer++;
													fruitTimer++;
													
													if (foodTimer>level){
														foodList.push({'x':foodDrop[Math.round(Math.random()*9)],'y':0});
														foodTimer = 0;//Without this, food would generate continuously
													}//Math.random generates a number between 0 and 1, Generating a random cupcake
														
													
													if (fruitTimer>3*level) {
														fruitList.push({'x':foodDrop[Math.round(Math.random()*9)],'y':-25});
														fruitTimer = 0;
													}//Generating a random fruit
												
													for (var i in fruitList) {
														if (fruit_catcher_collision(fruitList[i])) {
															droppingSound.play();
															gameover = true;
														}
													}//if you catch a fruit, it's game over amigo

													if (gameover) {
														if (catcher.y>=450)
															drawObject(catcherThree,catcher.x,catcher.y+20,50,30);
														else 
															drawObject(catcherOne,catcher.x,catcher.y,30,50);
														gameOver();
													}

													else if (catcher.onair) {
														drawObject(catcherFour,catcher.x,catcher.y,catcher.width,catcher.height);
													}//Animating the catcher when is in the air
													else if (animation === 0) {
														drawObject(catcherOne,catcher.x,catcher.y,catcher.width,catcher.height);
														animation = 1;
														}//Making the catcher blink
													else if (animation == 1) {
														drawObject(catcherTwo,catcher.x,catcher.y,catcher.width,catcher.height);
														animation = 0;
													}//Making the catcher blink

													for (i in foodList) {
														drawObject(food,foodList[i].x,foodList[i].y,foodObject.width,foodObject.height);
													}//Drawing the food

													for(i=0;i<tileList.length;i++) {
														drawObject(tile,tileList[i].x,tileList[i].y,tileObject.width,tileObject.height);
													}//Drawing the tiles
													
													for (i in fruitList) {
														drawObject(fruit,fruitList[i].x,fruitList[i].y,fruitObject.width,fruitObject.height);
													}//Drawing the fruit

													for (i in foodList) {
														if (food_catcher_collision(foodList[i])) {
															score++;
															eatingSound.play();
															if (score % 2 === 0)
																level--;
															foodList.splice(i,1);
														}
													}//If there is a collision between the food and the catcher
													for (i in foodList) {
														for (var j in tileList) {
															if (food_tile_collision(foodList[i],tileList[j])) {
																tileList.splice(j,1);
															}
														}
													}//If there is a collision between food and a tile, then remove the tile

													if (!catcher.onair) {
														for (i in tileList) {
															if (catcher_tile_collision(tileList[i])) {
																catcher.safe = true;
																break;
															}
															catcher.safe = false;
														}
														if (!catcher.safe) { 
															catcher.y += catcher.gravity;
														}//If the catcher is not standing on a tile, it falls
													}//Checking whether the catcher is safe or not

													drawObject(food,440,10,20,20);
													ctx.fillStyle = "#FFFFFF";
													ctx.font = "20px Calibri";
													ctx.fillText(score,465,27);
													ctx.fillText("Level "+(100-level+1),10,27);	
													updateFruitPosition();
													updateFoodPosition();
													updateCatcherPosition();
													jump();
												}
												else {
													ctx.save();
													ctx.strokeStyle = "#FFFFFF";
													ctx.font = "30px Calibri";
													ctx.strokeText("Game Paused",165,250);
													ctx.restore();
												}
											};//Removing all the elements, redrawing all the elements and so on

											var startGame = function() {
												score = 0;
												level = 100;
												catcher.x = 100;
												catcher.y = 350;
												catcher.onair = false;
												catcher.leftPressed = false;
												catcher.rightPressed = false;
												catcher.safe = true;
												animation = 0;
												foodTimer = 0;
												paused = false;
												gameover = false;
												tileList = [];
												foodList = [];
												fruitList = [];

												for (var i=0;i<=9;i++) {
													tileList.push({'x':i*50,'y':400});
												} // Initialising tiles with different values

												intervalVar = setInterval(updatePosition,10); // 100 fps game
											};
										};
										fruit.src = "images/fruit.png";
									};
									tile.src = "images/tile.png";
								};
								food.src = "images/food.png";
							};
							catcherFour.src = "images/catcher4.png";
						};
						catcherThree.src = "images/catcher3.png";
					};
					catcherTwo.src = "images/catcher2.png";
				};
				catcherOne.src = "images/catcher1.png";
			};
			blood.src = "images/blood.png";
		};
		background.src = "images/background.jpg";