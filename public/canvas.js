// var smallCanvas = document.getElementById("small-canvas");
// var bigCanvas = document.getElementById("big-canvas");
// var c = smallCanvas.getContext("2d");
// var b = bigCanvas.getContext("2d");

// c.strokeStyle = "black";
// c.lineWidth = 2;
// c.beginPath();
// c.arc(25, 10, 6, 0, Math.PI * 2);
// c.fillStyle = "chocolate";
// c.fill();
// c.stroke();

// //body
// c.lineWidth = 2;
// c.beginPath();
// c.moveTo(25, 16);
// c.lineTo(25, 35);
// c.closePath();
// c.stroke();
// // arms
// c.lineWidth = 2;
// c.beginPath();
// c.moveTo(15, 15);
// c.lineTo(25, 22.5);
// c.moveTo(25, 22.5);
// c.lineTo(35, 15);
// c.closePath();
// c.stroke();
// // legs
// c.lineWidth = 2;
// c.beginPath();
// c.moveTo(25, 35);
// c.lineTo(35, 40);
// c.moveTo(15, 40);
// c.lineTo(25, 35);
// c.closePath();
// c.stroke();

// var x = 0;
// var y = 0;
// // /*
// // BONUS exercise
// // Make your stick figure move around the canvas in response to clicks on arrow keys by the user. Use two canvases: one on which the stick figure is drawn, and another, larger canvas on which the first canvas is drawn as an image.
// // */
// (function() {
//     b.drawImage(smallCanvas, 0, 0, 100, 100);

//     document.addEventListener("keydown", function(event) {
//         if (event.keyCode === 37) {
//             if (x >= 0) {
//                 x -= 10; //move left
//                 renderDraw();
//             }
//         } else if (event.keyCode === 38) {
//             if (y >= 10) {
//                 y -= 10; //move up
//                 renderDraw();
//             }
//         } else if (event.keyCode === 39) {
//             if (x <= 450) {
//                 x += 10; //move right
//                 renderDraw();
//             }
//         } else if (event.keyCode === 40) {
//             if (y <= 445) {
//                 y += 10; //move down
//                 renderDraw();
//             }
//         }
//     });
// })();

// function renderDraw() {
//     //clear the canvas after each move
//     b.clearRect(0, 0, bigCanvas.height, bigCanvas.width);
//     //then redraw a new one after each clear
//     b.drawImage(smallCanvas, x, y, 100, 100);
// }
