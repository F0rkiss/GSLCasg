document.getElementById('myButton').onclick = function() {
    const imageInput = document.getElementById('imageInput');
    const filterSelect = document.getElementById('filterSelect');
    const originalCanvas = document.getElementById('originalCanvas');
    const resultCanvas = document.getElementById('resultCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const resultCtx = resultCanvas.getContext('2d');

    if (imageInput.files.length === 0) {
        alert('Please upload an image.');
        return;
    }

    const file = imageInput.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = function() {
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

        const aspectRatio = img.width / img.height;
        if (aspectRatio > 1) {
            originalCanvas.width = 300;
            originalCanvas.height = 300 / aspectRatio;
        } else {
            originalCanvas.height = 300;
            originalCanvas.width = 300 * aspectRatio;
        }
        originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);

        if (filterSelect.value === 'grayscale') {
            applyGrayscale(img, resultCanvas, resultCtx);
        } else if (filterSelect.value === 'blur') {
            applyBlur(img, resultCanvas, resultCtx);
        }
    };
};

function applyGrayscale(img, canvas, ctx) {
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg; // red
        data[i + 1] = avg; // green
        data[i + 2] = avg; // blue
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyBlur(img, canvas, ctx) {
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const radius = 5;
    const blurredData = new Uint8ClampedArray(data.length);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let r = 0, g = 0, b = 0, count = 0;

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                        const idx = (ny * canvas.width + nx) * 4;
                        r += data[idx];     // red
                        g += data[idx + 1]; // green
                        b += data[idx + 2]; // blue
                        count++;
                    }
                }
            }

            const idx = (y * canvas.width + x) * 4;
            blurredData[idx] = r / count; // red
            blurredData[idx + 1] = g / count; // green
            blurredData[idx + 2] = b / count; // blue
            blurredData[idx + 3] = data[idx + 3]; // alpha
        }
    }

    ctx.putImageData(new ImageData(blurredData, canvas.width, canvas.height), 0, 0);
}