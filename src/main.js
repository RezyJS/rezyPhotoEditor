const imageOperation = (image, callback, id, holderId, spinner) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  if (callback !== undefined && callback !== null) {
    callback(pixels)
  }

  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const holder = document.getElementById(holderId);

    holder.removeChild(holder.querySelector(`#${id}`))

    const obj = document.createElement('img');
    obj.classList.add('image')
    obj.id = id;
    obj.src = url;
    holder.appendChild(obj);

    spinner.classList.add('disabled')
  }, 'image/jpeg');

}

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

const makeHistogram = () => {}

const changeBrightness = () => {}

const toNegative = () => {}

const toBinaryColorScheme = () => {}

const moreContrast = () => {}

const lessContrast = () => {}

const gamma = () => {}

const kvantation = () => {}

const pseudoColoring = () => {}

const processFile = (photo, status, isNewPhoto) => {
  console.info('Started processing')

  const originalSpinner = document.getElementById('original-spinner');
  const changedSpinner = document.getElementById('changed-spinner');
  
  const originalImage = document.getElementById('original-image');
  const changedImage = document.getElementById('changed-image');

  if (isNewPhoto) {
    originalSpinner.classList.remove('disabled');
    originalImage.src = '';
    originalImage.alt = 'Wait...';
  }

  changedSpinner.classList.remove('disabled');
  changedImage.src = '';
  changedImage.alt = 'Wait...'

  const reader = new FileReader();
  
  reader.onload = (e) => {
    if (status === 'GrayScale') {
      operation = toGrayScale;
    } else {
      operation = null;
    }

    if (isNewPhoto) {
      const orig = new Image();
      orig.onload = () => {
        imageOperation(orig, null, "original-image", "original-photo", originalSpinner);
      }
      orig.src = e.target.result;
    }

    const changed = new Image();
    changed.onload = () => {
      imageOperation(changed, operation, 'changed-image', 'changed-photo', changedSpinner);
    }
    changed.src = e.target.result;
  }
  
  reader.readAsDataURL(photo);
}

(() => {

  let status = null;
  let operation = null;
  let photo = null;

  const imageInput = document.querySelector('.image-uploader')
  imageInput.addEventListener('input', (e) => {
    const file = e.target.files[0];
    const types = ['image/jpeg', 'image/png'];
    if (!file || !types.includes(file.type)) return;

    photo = file;

    processFile(photo, status, true);
  });

  const toGrayScaleCheckBox = document.getElementById('toGrayScale');
  toGrayScaleCheckBox.addEventListener('click', (e) => {
    if (e.target.checked) {
      status = 'GrayScale'
    } else {
      status = null;
    }

    if (photo !== null) {
      processFile(photo, status, false);
    }
  })
})()