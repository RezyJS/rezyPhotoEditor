const imageOperation = (image, callback, spinner) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  if (callback !== undefined && callback !== null) {
    callback(pixels); // Apply the callback (e.g., grayscale, negative)
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert the canvas to a Blob and display it
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const holder1 = document.querySelector('label#image-holder');
    const holder2 = document.querySelector('.image_dialog')

    // Remove the existing image
    const existingImage1 = holder1.querySelector('#image');
    const existingImage2 = holder2.querySelector('#image');
    
    if (existingImage1) {
      holder1.removeChild(existingImage1);
    }

    if (existingImage2) {
      holder2.removeChild(existingImage2);
    }

    // Create a new image element
    const obj1 = document.createElement('img');
    const obj2 = document.createElement('img');

    obj1.id = 'image';
    obj1.classList.add('image');
    obj1.src = url;

    obj2.id = 'image';
    obj2.classList.add('image_dialog__image');
    obj2.src = url;

    // Add event listeners for drag-and-drop
    obj1.addEventListener('dragenter', (e) => {
      e.target.style.backgroundColor = '#A288A6';
    });

    obj1.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    obj1.addEventListener('drop', (ev) => {
      ev.preventDefault();
      ev.target.style.backgroundColor = 'transparent';

      if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item) => {
          if (item.kind === 'file' && item.type.startsWith('image')) {
            const file = item.getAsFile();
            loadNewPhoto(file); // Load the dropped image
          }
        });
      }
    });

    obj1.addEventListener('dragleave', (e) => {
      e.target.style.backgroundColor = 'transparent';
    });

    holder1.appendChild(obj1); // Add the new image to the holder
    holder2.appendChild(obj2);

    spinner.classList.add('disabled'); // Hide the spinner

    if (callback !== null) photoStack.add(obj1);
  }, 'image/jpeg');
};

const toGrayScale = (pixels) => {
  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i];
    const green = pixels[i + 1];
    const blue = pixels[i + 2];
    // const alpha = pixels[i + 3];

    const I = 0.3 * red + 0.59 * green + 0.11 * blue;
    pixels[i] = I;
    pixels[i + 1] = I;
    pixels[i + 2] = I;
  }
}

const makeHistogram = (image) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match the image
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Initialize histogram array
  const histogram = new Array(256).fill(0);

  // Populate histogram using the grayscale values (assume grayscale image)
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = pixels[i]; // Grayscale value is in the red channel (all channels are equal)
    histogram[gray]++;
  }

  // Create histogram visualization canvas with padding
  const padding = 20; // 20px padding
  const histCanvas = document.createElement('canvas');
  histCanvas.width = 256 + padding * 2; // Add padding to both sides
  histCanvas.height = 100 + padding * 2; // Add padding to top and bottom
  const histCtx = histCanvas.getContext('2d');

  // Clear canvas with white background
  histCtx.fillStyle = '#1c1d21';
  histCtx.fillRect(0, 0, histCanvas.width, histCanvas.height);

  // Find maximum histogram value for normalization
  const maxCount = Math.max(...histogram);

  // Draw histogram bars with padding
  for (let i = 0; i < 256; i++) {
    const barHeight = (histogram[i] / maxCount) * (histCanvas.height - padding * 2); // Adjust height for padding
    const x = i + padding; // Shift bars right by padding
    const y = histCanvas.height - padding - barHeight; // Shift bars up by padding

    // Set the bar color to the grayscale intensity (i)
    histCtx.fillStyle = `rgb(${i}, ${i}, ${i})`; // Grayscale color
    histCtx.fillRect(x, y, 1, barHeight);
  }

  console.info(histogram);

  // Convert to image and display
  histCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const histHolder = document.querySelector('#col2');

    // Remove existing image
    const existingImage = histHolder.querySelector('#histHolder');
    if (existingImage) histHolder.removeChild(existingImage);

    // Create new image element
    const img = document.createElement('img');
    img.id = 'histHolder';
    img.src = url;
    histHolder.appendChild(img);
  }, 'image/png');
};

const changeBrightness = (pixels) => {
  const clamp = (num) => Math.min(Math.max(num, 0), 255);
  const brightness = +(document.querySelector("#slider-brightness").value);

  for (let i = 0; i < pixels.length; i += 4) {
    const red = clamp(pixels[i] + brightness);
    const green = clamp(pixels[i + 1] + brightness);
    const blue = clamp(pixels[i + 2] + brightness);
    // const alpha = pixels[i + 3];

    pixels[i] = red;
    pixels[i + 1] = green;
    pixels[i + 2] = blue;
  }
}

const toNegative = (pixels) => {
  const negative = +(document.querySelector("#slider-negative").value);

  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i] >= negative ? 255 - pixels[i] : pixels[i];
    const green = pixels[i + 1] >= negative ? 255 - pixels[i + 1] : pixels[i + 1];
    const blue = pixels[i + 2] >= negative ? 255 - pixels[i + 2] : pixels[i + 2];
    // const alpha = pixels[i + 3];

    pixels[i] = red;
    pixels[i + 1] = green;
    pixels[i + 2] = blue;
  }
}

const toBinaryColorScheme = (pixels) => {
  const binary = +(document.querySelector("#slider-binarization").value);

  for (let i = 0; i < pixels.length; i += 4) {
    const red = pixels[i] >= binary ? 255 : 0;
    const green = pixels[i + 1] >= binary ? 255 : 0;
    const blue = pixels[i + 2] >= binary ? 255 : 0;
    // const alpha = pixels[i + 3];

    pixels[i] = red;
    pixels[i + 1] = green;
    pixels[i + 2] = blue;
  }
}

const moreContrast = (pixels) => {
  const Q1 = +(document.querySelector("#picker-contrast-upper").value);
  const Q2 = +(document.querySelector("#picker-contrast-lower").value);

  console.info(Q1 + " " + Q2);

  for (let i = 0; i < pixels.length; i += 4) {
    const red = (pixels[i] - Q1) * 255 / (Q2 - Q1);
    const green = (pixels[i + 1] - Q1) * 255 / (Q2 - Q1);
    const blue = (pixels[i + 2] - Q1) * 255 / (Q2 - Q1);
    // const alpha = pixels[i + 3];

    pixels[i] = red;
    pixels[i + 1] = green;
    pixels[i + 2] = blue;
  }
}

const lessContrast = (pixels) => {
  const Q1 = +(document.querySelector("#picker-contrast-upper").value);
  const Q2 = +(document.querySelector("#picker-contrast-lower").value);

  console.info(Q1 + " " + Q2);
  console.info(Q2 - Q1);
  console.info(Q1 + pixels[0]) * (Q2 - Q1) / 255

  for (let i = 0; i < pixels.length; i += 4) {
    const red = (Q1 + pixels[i]) * (Q2 - Q1) / 255;
    const green = (Q1 + pixels[i + 1]) * (Q2 - Q1) / 255;
    const blue = (Q1 + pixels[i + 2]) * (Q2 - Q1) / 255;
    // const alpha = pixels[i + 3];

    pixels[i] = red;
    pixels[i + 1] = green;
    pixels[i + 2] = blue;
  }
}

const gamma = (pixels) => {}

const kvantation = (pixels) => {}

const pseudoColoring = (pixels) => {}

function storage() {
  const stack = [];
  let ptr = -1;

  function add(photo) {
    if (ptr < stack.length - 1) {
      stack.length = ptr + 1;
    }

    stack.push(photo);
    ++ptr;
  }

  function newStack() {
    stack.length = 0;
    ptr = -1;
  }

  function reset() {
    stack.length = 1;
    ptr = 0;
  }

  function revert() {
    if (ptr > 0) {
      --ptr;
    }
  }

  function unrevert() {
    if (ptr < stack.length - 1) {
      ++ptr;
    }
  }

  function getCurrentPhoto() {
    return stack[ptr];
  }

  function isEmpty() {
    return stack.length === 0;
  }

  return { add, newStack, revert, unrevert, getCurrentPhoto, reset, isEmpty };
}

const photoStack = storage();

const processFile = (operation) => {

  const photoHolder = document.querySelector('.image');
  const spinner = document.querySelector('.spinner');

  if (photoStack.isEmpty()) {
    alert('No photos loaded!')
    spinner.classList.add('disabled');
    photoHolder.classList.remove('disabled');
    return;
  }

  if (operation === 'enlarge') {
    document.querySelector('#image_dialog').classList.remove('disabled');
    return;
  }

  // Change photo to spinner  
  if (photoHolder && operation !== 'histogram') {
    photoHolder.classList.add('disabled');
  }

  if (spinner && operation !== 'histogram') {
    spinner.classList.remove('disabled');
  }

  let toOperate = null;
  switch (operation) {
    case 'histogram':
      makeHistogram(photoStack.getCurrentPhoto());
      return;
    case 'grayscale':
      toOperate = toGrayScale;
      break;
    case 'negative':
      toOperate = toNegative;
      break;
    case 'bright':
      toOperate = changeBrightness;
      break;
    case 'binary':
      toOperate = toBinaryColorScheme;
      break;
    case 'more-contrast':
      toOperate = moreContrast;
      break;
    case 'less-contrast':
      toOperate = lessContrast;
      break;
    case 'revert':
      photoStack.revert();
      break;
    case 'unrevert':
      photoStack.unrevert();
      break;
    case 'reset':
      photoStack.reset();
      break;
    case 'show':
    default:
      break;
  }

  // Get the last image from the stack
  const image = photoStack.getCurrentPhoto();
  if (image instanceof HTMLImageElement) {    
    imageOperation(image, toOperate, spinner);
  }
};

const loadNewPhoto = (photo) => {
  photoStack.newStack();
  loadPhoto(photo);
}

const loadPhoto = (photo) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const image = new Image();
    image.onload = () => {
      // Push the loaded image (HTMLImageElement) to the stack
      photoStack.add(image);
      processFile('show');
    };
    image.src = e.target.result; // Set the image source to the data URL
  };

  reader.readAsDataURL(photo); // Read the file as a data URL
};

export { processFile, loadNewPhoto };