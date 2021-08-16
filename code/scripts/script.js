/* Program: script.js
 * Programmer: Leonard Michel
 * Start Date: 11.08.2021
 * Last Change:
 * End Date: /
 * License: /
 * Version: 0.0.0.0
*/

/**** INITIALIZATION ****/

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;

let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

ctx.save();

let radians = Math.PI / 180;

/* Audio Object Definitions */
let audioButtonPressed = new Audio("audio/audioButtonPressed.mp3");
let audioButtonPressedIsReady = false;
audioButtonPressed.addEventListener("canplaythrough", function () { audioButtonPressedIsReady = true; });

/* Mouse Input */
let mouseX = 0;
let mouseY = 0;
let mouseLeftPressed = false,
    mouseRightPressed = false;

let mouseLeftPressedBefore = false,
    mouseRightPressedBefore = false;

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseMoveHandler(e)
{
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function mouseDownHandler(e)
{
    if (e.button == 0) { mouseLeftPressed = true; };
    if (e.button == 2) { mouseRightPressed = true; };
}

function mouseUpHandler(e)
{
    if (e.button == 0) { mouseLeftPressed = false; };
    if (e.button == 2) { mouseRightPressed = false; };
}

/* Key Presses */
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

let wPressed = false,
    aPressed = false,
    sPressed = false,
    dPressed = false,
    jPressed = false,
    kPressed = false,
    lPressed = false;

let wPressedBefore = false,
    aPressedBefore = false,
    sPressedBefore = false,
    dPressedBefore = false,
    jPressedBefore = false,
    kPressedBefore = false,
    lPressedBefore = false;

function keyDownHandler(e)
{
    if (e.code == "KeyW") { wPressed = true; }
    if (e.code == "KeyA") { aPressed = true; }
    if (e.code == "KeyS") { sPressed = true; }
    if (e.code == "KeyD") { dPressed = true; }

    if (e.code == "KeyJ") { jPressed = true; }
    if (e.code == "KeyK") { kPressed = true; }
    if (e.code == "KeyL") { lPressed = true; }
}

function keyUpHandler(e)
{
    if (e.code == "KeyW") { wPressed = false; }
    if (e.code == "KeyA") { aPressed = false; }
    if (e.code == "KeyS") { sPressed = false; }
    if (e.code == "KeyD") { dPressed = false; }

    if (e.code == "KeyJ") { jPressed = false; }
    if (e.code == "KeyK") { kPressed = false; }
    if (e.code == "KeyL") { lPressed = false; }
}

/* Class Definitions */
class Map
{
	constructor()
	{
		this.map = [];
		this.map += "1111111111111111";
		this.map += "1000000000000001";
		this.map += "1000000000000001";
		this.map += "1000000000000001";
		this.map += "1000000000000001";
		this.map += "1000000000000001";
		this.map += "1000000000000001";
		this.map += "1111111111111111";
		this.texture = [new Image(), new Image(), new Image(), new Image(), new Image()];
		this.texture[0].src = "textures/blank.png";
		this.texture[1].src = "textures/notexture.png";

		this.w = 16;
		this.h = 8;
		this.drawOffsetX = 0;//SCREEN_WIDTH/2 - this.w*this.tileSize/2;
		this.drawOffsetY = 0;//SCREEN_HEIGHT/2 - this.h*this.tileSize/2;
	}

	draw()
	{
		for (let y = 0; y < this.h; y++)
		{
			for (let x = 0; x < this.w; x++)
			{
				let n = this.map[x + y*this.w];
				//console.log(n);
				// The (1+y) accommodates for "flipping" the canvas and the drawImage function drawing the image from top-left to bottom-right.
				ctx.drawImage(this.texture[n], this.drawOffsetX + x*TILE_SIZE, this.drawOffsetY + SCREEN_HEIGHT - (1+y)*TILE_SIZE);
			}
		}
	}
}

class Player
{
	constructor(x = 0, y = 0, w = 1, h = 2, c = "#3ab2fc", url = "textures/notexture.png")
	{
		this.x = x;
		this.y = y;
		this.velX = 0;
		this.velY = 0;
		this.gravity = -100;
		this.width = w;
		this.height = h;
		this.fillColor = c;

		this.textureHeadURL = url;
		this.textureLegsURL = url;
		this.imageHead = new Image();
		this.imageLegs = new Image();
		this.imageHead.src = this.textureHeadURL;
		this.imageLegs.src = this.textureLegsURL;

		// Does the player get drawn.
		this.isVisible = true;
		// Does the player take part in collision detection.
		this.isCollider = true;
		// Is the player touching a block below itself. If not, he may be in the air, flying or swimming.
		this.isGrounded = false;
		// Is the player in the air.
		this.isAerial = true;
	}

	draw()
	{
		// Draw head
		ctx.drawImage(this.imageHead, this.x*TILE_SIZE, SCREEN_HEIGHT - (this.y+2)*TILE_SIZE);
		// Draw legs
		ctx.drawImage(this.imageHead, this.x*TILE_SIZE, SCREEN_HEIGHT - (this.y+1)*TILE_SIZE);
	}

	handleInput()
	{
		if (this.isGrounded)
		{
			// Jump
			if (wPressed) { this.velY = 2; };
			// Walk left
			if (aPressed) { this.velX = -50; };
			if (!aPressed) { this.velX = 0; };
			if (sPressed) { };
			// Walk right
			if (dPressed) { this.velX = 50; };
			if (!dPressed) { this.velX = 0; };
		}
		else if (!this.isGrounded)
		{
			if (this.isAerial)
			{
				// Fall left
				if (aPressed) { this.velX = -0.5; };
				// Fall right
				if (dPressed) { this.velX =  0.5; };
			}
		}
	}

	applyForces()
	{
		this.velY += this.gravity * elapsedTime/1000;
		this.x += this.velX * elapsedTime/1000;
		this.y += this.velY * elapsedTime/1000;
	}

	collisionDetection()
	{
		for (let y = 0; y < MAP_HEIGHT; y++)
		{
			for (let x = 0; x < MAP_WIDTH; x++)
			{
				// How much is the player going past the edges of the current block.
				let l = 0,
					r = 0,
					t = 0,
					b = 0;

				if (map[x + y*MAP_WIDTH] != "0")
				{
					// If left edge of player is inside block, push him to the right.
					if (this.x > x && this.x < x+1)
					{
						//l = i - this.x;
						this.velX = 0;
						this.x = Math.ceil(this.x);
						console.log("Left edge of player is inside block.\n");
					}
					// If right edge of player is inside block.
					if (this.x+this.width > x && this.x+this.width < x+1)
					{
						//r = i - this.x+this.width;
						this.velX = 0;
						this.x = Math.floor(this.x);
						console.log("Right edge of player is inside block.\n");
					}
					// Bottom edge of player is inside block.
					if (this.y > y && this.y < y+1)
					{
						//t = i - this.y;
						this.velY = 0;
						this.y = Math.ceil(this.y);
						console.log("Bottom edge of player is inside block.\n");
					}
					// Top edge of player is inside block.
					if (this.y+this.height > y && this.y+this.height < y+1)
					{
						//b = i - this.y+this.height;
						this.y = Math.floor(this.y);
						this.isAerial = true;
						console.log("Top edge of player is inside block.\n");
					}

					// If the player is right above a block.
					if (this.y-1 == y)
					{
						//this.isGrounded = true;
					}
					else
					{
						this.isGrounded = false;
						//this.isAerial = true;
					}
					//this.x += l + r;
					//this.y += t + b;
				}
			}
		}
	}
}

class Button
{
	constructor()
	{
        this.x = 0;
        this.y = 0;
        this.width = 150;
        this.height = 50;
        // Colors
        this.colEdgeNeutral = "#888888";
        this.colFaceNeutral = "#00000044";
        this.colEdgeHover = "#bbbbbb";
        this.colFaceHover = "#00000088";
        this.colEdgePressed = "#ffffff";
        this.colFacePressed = "#000000bb";
        this.colTextFill = "#000000";
        this.colTextShadow = "#ffffff";
        // Color assignment
        this.edgeColor = this.colEdgeNeutral;
        this.faceColor = this.colFaceNeutral;

        this.text = "Button";
        this.isPressed = false;
        this.isVisible = true;
		this.playSound = true;
        // How often can the user click the button.
        this.clickSpeed = 50;
        this.clickTick = Date.now();
	}

    update()
    {
        this.collisionDetection();
		this.draw();
		this.playAudio();
    }

    collisionDetection()
    {
        // Only let the user click the button if the wait time has been passed
        if (tp1 - this.clickTick >= this.clickSpeed)
        {
            // If mouse is within button bounds.
            if (mouseX >= this.x && mouseX < this.x + this.width && mouseY >= this.y && mouseY < this.y + this.height)
            {
                // If mouse clicked on button
                if (mouseLeftPressed)
                {
                    if (mouseLeftPressedBefore == false)
                    {
                        this.edgeColor = this.colEdgePressed;
                        this.faceColor = this.colFacePressed;

                        this.isPressed = true;
                        mouseLeftPressedBefore = true;
                    }
                }
                // If mouse is hovering on button
                if (!mouseLeftPressed)
                {
                    this.edgeColor = this.colEdgeHover;
                    this.faceColor = this.colFaceHover;

                    this.isPressed = false;
                    mouseLeftPressedBefore = false;
                }
            }
            // If mouse is out of button bounds.
            else
            {
                this.edgeColor = this.colEdgeNeutral;
                this.faceColor = this.colFaceNeutral;

                this.isPressed = false;
            }

            this.clickTick = Date.now();
        }
    }

    draw()
    {
		if (this.isVisible)
		{
			// Draw fill
			ctx.fillStyle = this.faceColor;
			ctx.fillRect(this.x, this.y, this.width, this.height);

			// Draw border
			ctx.strokeStyle = this.edgeColor;
			ctx.strokeRect(this.x, this.y, this.width, this.height);

			// Draw text
			let textPosX = this.x + (this.width / 2),
				textPosY = this.y + (this.height / 1.5),
				textSize = this.height/1.5;

			ctx.textAlign = "center";
			ctx.font = this.height / 2 + "px sans-serif";

			// Text shadow
			ctx.fillStyle = this.colTextShadow;
			ctx.fillText(this.text, textPosX + textSize/128, textPosY + textSize/128);

			// Actual text
			ctx.fillStyle = this.colTextFill;
			ctx.fillText(this.text, textPosX, textPosY);
		}

    }

	playAudio()
	{
		if (this.playSound)
		{
			if (this.isPressed)
			{
				if (audioButtonPressedIsReady) { audioButtonPressed.play(); };
			}
		}
	}
}
/* Function definitions */
function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum and minimum are inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let player = new Player(4, 2);

let map = new Map();
let TILE_SIZE = 16;
let MAP_WIDTH = 16;
let MAP_HEIGHT = 8;

// Time variables
let tp1 = Date.now();
let tp2 = Date.now();
let elapsedTime = 0;

// The game loop
window.main = function ()
{
    window.requestAnimationFrame(main);
    // Get elapsed time for last tick.
    tp2 = Date.now();
    elapsedTime = tp2 - tp1;
    //console.log("elapsedTime:" + elapsedTime + "\n");
    tp1 = tp2;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	/* Draw */
	map.draw();
	player.draw();

	/* Input */
	player.handleInput();

	/* Apply forces */
	player.applyForces();

	/* Collision detection */
	player.collisionDetection();
}

// Start the game loop
main();