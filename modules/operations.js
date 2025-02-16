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
    const holder = document.querySelector('label#image-holder');

    // Remove the existing image
    const existingImage = holder.querySelector('.image');
    if (existingImage) {
      holder.removeChild(existingImage);
    }

    // Create a new image element
    const obj = document.createElement('img');
    obj.classList.add('image');
    obj.src = url;

    // Add event listeners for drag-and-drop
    obj.addEventListener('dragenter', (e) => {
      e.target.style.backgroundColor = '#A288A6';
    });

    obj.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    obj.addEventListener('drop', (ev) => {
      ev.preventDefault();
      ev.target.style.backgroundColor = 'transparent';

      if (ev.dataTransfer.items) {
        [...ev.dataTransfer.items].forEach((item) => {
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            loadNewPhoto(file); // Load the dropped image
          }
        });
      }
    });

    obj.addEventListener('dragleave', (e) => {
      e.target.style.backgroundColor = 'transparent';
    });

    holder.appendChild(obj); // Add the new image to the holder

    spinner.classList.add('disabled'); // Hide the spinner

    if (callback !== null) photoStack.add(obj);
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

const makeHistogram = (pixels) => {}

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
  // Change photo to spinner
  const photoHolder = document.querySelector('.image');
  if (photoHolder) {
    photoHolder.classList.add('disabled');
  }

  const spinner = document.querySelector('.spinner');
  if (spinner) {
    spinner.classList.remove('disabled');
  }

  let toOperate = null;
  switch (operation) {
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
  if (photoStack.isEmpty()) {
    alert('No photos loaded!')
    spinner.classList.add('disabled');
    photoHolder.classList.remove('disabled');
    return;
  }

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
  // Change photo to spinner
  const photoHolder = document.querySelector('.image');
  if (photoHolder) {
    photoHolder.classList.add('disabled');
  }

  const spinner = document.querySelector('.spinner');
  if (spinner) {
    spinner.classList.remove('disabled');
  }

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