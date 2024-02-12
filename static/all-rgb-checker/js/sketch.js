
const fitRatio = 0.80;
let canvas;
let imgFile;
let pImage;
let msg = `Drag and drop a file on the screen\nto check if it is a valid "allRGB" image.`;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.drop(gotFile);

  imageMode(CENTER);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
}

function draw() {
  background(0);

  if (pImage) {
    const boxS = width > height ? fitRatio * height : fitRatio & width;
    const scaleRatio = pImage.width > pImage.height ? boxS / pImage.width : boxS / pImage.height;
    const imgW = scaleRatio * pImage.width;
    const imgH = scaleRatio * pImage.height;
    image(pImage, 0.5 * width, 0.5 * height, imgW, imgH);
  }

  if (imgFile) {
    textSize(12);
    text(`File name: '${imgFile.name}', file type: ${imgFile.type}, file size: ${imgFile.size} bytes`, width / 2, 30);
  }

  textSize(24);
  text(msg, width / 2, height - 40);
}

function gotFile(file) {
  imgFile = file;

  msg = 'Parsing file...';
  const img = createImg(file.data, file.name);
  img.hide(); // hide image element in dom

  pImage = loadImage(img.attribute("src"), computeAllRGB);
}

function computeAllRGB(img) {
  img.loadPixels();

  if (img.pixels.length != 4 * 256 * 256 * 256)
  {
    msg = `❌ Image IS NOT "allRGB": image contains ${img.pixels.length / 4} pixels\n(the full RGB spectrum contains 16,777,216 colors)`;
    return;
  }

  const rgbMap = powerArray(256, 256, 256);

  // Load rgb values
  let r, g, b;
  for (let i = 0; i < img.pixels.length; i += 4) {
    r = img.pixels[i];
    g = img.pixels[i + 1];
    b = img.pixels[i + 2];

    rgbMap[r][g][b] += 1;
  }

  let good = true;
  let duplicateMsg;
  for (r = 0; r < 256; r++) {
    for (g = 0; g < 256; g++) {
      for (b = 0; b < 256; b++) {
        if (rgbMap[r][g][b] != 1) {
          duplicateMsg = `rgb(${r},${g},${b}) has ${rgbMap[r][g][b]} instances`;
          good = false;
          break;
        }
      }
      if (!good) break;
    }
    if (!good) break;
  }

  if (good) {
    msg = '✔️ Image is "allRGB"';
  } else {
    msg = '❌ Image IS NOT "allRGB": ' + duplicateMsg;
  }
}




function windowResize() {
  resizeCanvas(windowWidth, windowHeight);
}

// https://medium.com/fractions/multidimensional-arrays-in-javascript-be344f27df0e
function powerArray(length) {
  let array = new Array(length ?? 0).fill(0);
  let i = length

  // If the parameters are more than one, we iterate over them one by one 
  // and using line 2 of this function, we create inner arrays.
  if (arguments.length > 1) {
    let dimensions = Array.prototype.slice.call(arguments, 1);

    // We recall the `powerArray` function for the rest of the parameters / dimensions.
    while (i--) array[length - 1 - i] = powerArray.apply(this, dimensions);
  }

  return array;
}