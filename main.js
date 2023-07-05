class Node {
  static width = 64;
  static height = 64;
  
  static localOffsetX = 0;
  static localOffsetY = 0;

  static borderSize = 2;

  constructor(cordX, cordY, cordZ) {
    this.cordX = cordX;
    this.cordY = cordY;
    this.cordZ = cordZ;

    this.bombPlaced = false;
    this.playerStands = false;
    this.blockedNode = false;
    this.destructible = false;
    this.inBlastZone = false;

    this.realCordX = (this.cordX * Node.width);
    this.realCordY = (this.cordY * Node.height);
  }
  
  render(context) {
    context.fillStyle = "Green";

    if (this.blockedNode)
      context.fillStyle = "Black"

    if (this.destructible)
      context.fillStyle = "Gray"
    
    if (this.inBlastZone)
      context.fillStyle = "Yellow";

    if (this.bombPlaced)
      context.fillStyle = "Red";

    if (this.playerStands)
      context.fillStyle = "Blue";


    context.fillRect(
      this.realCordX + Node.localOffsetX,
      this.realCordY + Node.localOffsetY,
      Node.width,
      Node.height
    );
      
    context.strokeRect(
      this.realCordX + Node.localOffsetX,
      this.realCordY + Node.localOffsetY,
      Node.width,
      Node.height
    );
  }
}

var WindowWidth = window.innerWidth;
var WindowHeight = window.innerHeight;

const arr = [];

var toBeExploded = [];
var timeToExplode = 0;
var amountOfBlocksToDestroy = 0;

function setupMap(){
  for (let i = 0; i < mapsize; i++) {
    for (let j = 0; j < mapsize; j++) {
      if (i == 0 || i == mapsize - 1 || j == 0 || j == mapsize - 1) {
        arr[i][j].blockedNode = true;
      }
      if (i % 2 == 0 && j % 2 == 0) {
        arr[i][j].blockedNode = true;
      }
      randomNumber = Math.random();
      if (!arr[i][j].blockedNode && randomNumber > 0.20) {
        arr[i][j].destructible = true;
        amountOfBlocksToDestroy++;
      }
    }
  }
}

const mapsize = 21;
var randomNumber;
for (let i = 0; i < mapsize; i++) {
  const row = [];
  for (let j = 0; j < mapsize; j++) {
    const node = new Node(i,j,0);
    row.push(node);
  }
  arr.push(row);
}

setupMap();

var playerCordX = Math.round((WindowWidth / 2) / 64);
var playerCordY = Math.round((WindowHeight / 2) / 64);

var prevPlayerCordX = playerCordX;
var prevPlayerCordY = playerCordY;

var camDistanceX = 0;
var camDistanceY = 0;

window.addEventListener("keydown", (event) => {

  prevPlayerCordX = playerCordX;
  prevPlayerCordY = playerCordY;

  switch(event.key) {
    case 'a': 
      if (playerCordX - 1 >= 0) {
        if (!arr[playerCordX - 1][playerCordY].blockedNode && !arr[playerCordX - 1][playerCordY].destructible) {
          camDistanceX += 64; 
          playerCordX--;
        }
      }
      break;
    case 'd':
      if (playerCordX + 1 < mapsize) {
        if (!arr[playerCordX + 1][playerCordY].blockedNode && !arr[playerCordX + 1][playerCordY].destructible) {
          camDistanceX -= 64;
          playerCordX++;  
        }
      }
      break;
    case 'w':
      if (playerCordY - 1 >= 0) {
        if (!arr[playerCordX][playerCordY - 1].blockedNode && !arr[playerCordX][playerCordY - 1].destructible) {
          camDistanceY += 64;
          playerCordY--;
        }
      }
      break;
    case 's':
      if (playerCordY + 1 < mapsize) {
        if (!arr[playerCordX][playerCordY + 1].blockedNode && !arr[playerCordX][playerCordY + 1].destructible) {
          camDistanceY -= 64; 
          playerCordY++;
        }
      }
      break;
    case 'x':

      if (timeToExplode == 0) {

        arr[playerCordX][playerCordY].bombPlaced = true;

        toBeExploded.push(arr[playerCordX][playerCordY]);

        var bombRadius = 2;

        for (var i = -bombRadius; i <= bombRadius; i++) {
          for (var j = -bombRadius; j <= bombRadius; j++) {
            if (playerCordX + i >= 0 && playerCordX + i < mapsize && playerCordY + j >= 0 && playerCordY + j < mapsize) {
              if (!arr[playerCordX + i][playerCordY + j].blockedNode) {
                arr[playerCordX + i][playerCordY + j].inBlastZone = true;
                toBeExploded.push(arr[playerCordX + i][playerCordY + j]);
              }
            }
          }
        }

        timeToExplode = new Date().getTime();

      }
      break;
  }

  arr[Math.round((prevPlayerCordX))][Math.round((prevPlayerCordY))].playerStands = false;
  arr[Math.round((playerCordX))][Math.round((playerCordY))].playerStands = true;

});

let Canvas = document.getElementById("canvas");
let Context = Canvas.getContext("2d");

Canvas.width = WindowWidth
Canvas.height = WindowHeight

arr[Math.round((playerCordX))][Math.round((playerCordY))].playerStands = true;
  
var lastUpdate = Date.now();

let updateCircle = function() {

  var now = Date.now();
  var diff = now - lastUpdate;
  
  if (camDistanceX < 0) {
    Node.localOffsetX -= 8;
    camDistanceX += 8;
  }
  else if (camDistanceX > 0) {
    Node.localOffsetX += 8;
    camDistanceX -=8;
  }  

  if (camDistanceY < 0) {
    Node.localOffsetY -= 8;
    camDistanceY += 8;
  }
  else if (camDistanceY > 0) {
    Node.localOffsetY += 8;
    camDistanceY -=8;
  }

  if (diff > 1000) 
    lastUpdate = now;
  
  if (now - timeToExplode > 2000) {
    for (var x = 0; x < toBeExploded.length; x++) {

      if (toBeExploded[x].destructible)
        amountOfBlocksToDestroy--;

      toBeExploded[x].inBlastZone = false;
      toBeExploded[x].destructible = false;
      toBeExploded[x].bombPlaced = false;
    }

    toBeExploded = [];
    timeToExplode = 0;

    if (amountOfBlocksToDestroy <= 0)
      setupMap();

  }

  Context.clearRect(0,0,WindowWidth,WindowHeight)
  requestAnimationFrame(updateCircle);

  for (let i = 0; i < mapsize; i++) 
    for (let j = 0; j < mapsize; j++) 
      arr[i][j].render(Context);
  
}

updateCircle();



