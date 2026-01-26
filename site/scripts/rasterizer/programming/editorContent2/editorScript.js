// the examples will have a special canvas with id "outputCanvas"
// this is usually fixed in the examples, so you don't need to worry about it
const canvas = document.getElementById('outputCanvas');
// for setting the output
const ctx = canvas.getContext('2d');

// creates a zero filled float image with size 300x300 and 4 channels (RGBA)
const img = PixelImage.zeroF32(300, 300, 4);

// set a single pixel with a white color in the center
// colors are in the range [0,1]
img.set(vec4(1, 1, 1, 1), 150, 150);

// draw a line along x
for (let i = 20; i < 100; i++) {
    img.set(vec4(1, 0, 0, 1), i, 20);
}

// fill a section of the image
for (let y = 120; y < 140; y++) {
    for (let x = 200; x < 260; x++) {
        img.set(vec4(0, 1, 1, 1), x, y);
    }
}

// transfer the image to the context (this will resize the canvas, if needed)
imageToCtx(img, ctx);