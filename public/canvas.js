// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;

let canvas = document.getElementById('canvas');

if (canvas) {
    let context = canvas.getContext('2d');

    // The x and y offset of the canvas from the edge of the page
    const rect = canvas.getBoundingClientRect();

    // Add the event listeners for mousedown, mousemove, and mouseup
    canvas.addEventListener('mousedown', e => {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        isDrawing = true;
    });

    canvas.addEventListener('mousemove', e => {
        if (isDrawing === true) {
            drawLine(
                context,
                x,
                y,
                e.clientX - rect.left,
                e.clientY - rect.top
            );
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
    });

    canvas.addEventListener('mouseup', e => {
        if (isDrawing === true) {
            drawLine(
                context,
                x,
                y,
                e.clientX - rect.left,
                e.clientY - rect.top
            );
            x = 0;
            y = 0;
            isDrawing = false;
        }
        document.getElementById('signature').value = canvas.toDataURL();
        console.log('dataurl', canvas.toDataURL());
    });

    function drawLine(context, x1, y1, x2, y2) {
        context.beginPath();
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    window.addEventListener('submit', e => {
        let sig = document.getElementById('signature');
        if (!sig.value) {
            e.preventDefault();
            console.log('empty signature');
            document.getElementById('sig-error').classList.remove('hidden');
        }
    });
}

// var canvas = $("#canvas");
// var myContext = canvas[0].getContext("2d");
// var dataURL = canvas[0].toDataURL();

// $(document).on("mousedown", function(e) {
//     var left = e.clientX - canvas.offset().left;
//     var top = e.clientY - canvas.offset().top;

//     myContext.lineWidth = 2;
//     myContext.beginPath();
//     myContext.moveTo(left, top);
//     console.log("mousedown");

//     $(document).on("mousemove", function(e) {
//         var left = e.clientX - canvas.offset().left;
//         var top = e.clientY - canvas.offset().top;
//         myContext.lineTo(left, top);
//         myContext.stroke();
//         console.log("mousemove");
//     });
// });

// $(document).on("mouseup", function(e) {
//     console.log("mouseup!");

// $('input[name="signature"]').val(dataURL);
// });
