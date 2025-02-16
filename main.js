import { processFile, loadNewPhoto } from './modules/operations.js'

// Wait for all resources to load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  main();
});

const main = () => {
  const contrastPickerLower = document.getElementById('picker-contrast-lower');
  const contrastPickerUpper = document.getElementById('picker-contrast-upper');

  function updatePickerConstraints() {
      // Ensure values stay within 0-255 range
      let val1 = Math.min(255, Math.max(0, parseInt(contrastPickerLower.value) || 0));
      let val2 = Math.min(255, Math.max(0, parseInt(contrastPickerUpper.value) || 0));

      // Enforce picker1 ≤ picker2
      if (val1 > val2) {
        contrastPickerUpper.value = val1;
        val2 = val1;
      }
      if (val2 < val1) {
        contrastPickerLower.value = val2;
        val1 = val2;
      }

      // Update constraints
      contrastPickerUpper.min = val1;
      contrastPickerLower.max = val2;
  }

  contrastPickerLower.addEventListener('input', updatePickerConstraints);
  contrastPickerUpper.addEventListener('input', updatePickerConstraints);

  const negativeSlider = document.querySelector("#slider-negative");
  const negativeOutput = document.querySelector("#slider-negative-value");
  negativeOutput.innerHTML = negativeSlider.value;
  negativeSlider.oninput = function() {
    negativeOutput.innerHTML = this.value;
  }

  const binarySlider = document.querySelector("#slider-binarization");
  const binaryOutput = document.querySelector("#slider-binarization-value");
  binaryOutput.innerHTML = binarySlider.value;
  binarySlider.oninput = function() {
    binaryOutput.innerHTML = this.value;
  }

  const brightnessSlider = document.querySelector("#slider-brightness");
  const brightnessOutput = document.querySelector("#slider-brightness-value");
  brightnessOutput.innerHTML = brightnessSlider.value;
  brightnessSlider.oninput = function() {
    brightnessOutput.innerHTML = this.value;
  }

  const moreContrastButton = document.querySelector('#btn-contrast-more');
  moreContrastButton.addEventListener('click', () => {
    processFile('more-contrast')
  })

  const lessContrastButton = document.querySelector('#btn-contrast-less');
  lessContrastButton.addEventListener('click', () => {
    processFile('less-contrast')
  })
  
  const brightnessButton = document.querySelector('#btn-brightness');
  brightnessButton.addEventListener('click', () => {
    processFile('bright')
  })

  const revertButton = document.querySelector('#btn-stack-revert'); 
  revertButton.addEventListener('click', () => {
    processFile('revert')
  })
  
  const unrevertButton = document.querySelector('#btn-stack-unrevert'); 
  unrevertButton.addEventListener('click', () => {
    processFile('unrevert')
  })

  const cancelButton = document.querySelector('#btn-stack-reset');
  cancelButton.addEventListener('click', () => {
    processFile('reset')
  })

  const enlargeButton = document.querySelector('#btn-enlarge');
  enlargeButton.addEventListener('click', () => {
    alert('WIP');
  })

  const toGrayScaleButton = document.querySelector('#btn-grayscale');
  toGrayScaleButton.addEventListener('click', () => {
    processFile('grayscale');
  })

  const toNegativeButton = document.querySelector('#btn-negative');
  toNegativeButton.addEventListener('click', () => {
    processFile('negative');
  })

  const binaryButton = document.querySelector('#btn-binarization');
  binaryButton.addEventListener('click', () => {
    processFile('binary');
  })

  const image = document.querySelector('.image');
  console.info(image)
  image.addEventListener('dragenter', (e) => {
    e.target.style.backgroundColor = '#A288A6';
  }); 

  image.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.type = 'file'
  });

  image.addEventListener('drop', (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.target.style.backgroundColor = 'transparent';

    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === "file" && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          loadNewPhoto(file);
        }
      });
    }
  });

  image.addEventListener('dragleave', (e) => {
    e.target.style.backgroundColor = 'transparent';
  });

  const imageHolder = document.querySelector('#image-holder');
  imageHolder.addEventListener('input', (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith('image')) {
      alert('This file is not an image!')
      return;
    }

    const photo = new File([file], file.name, { type: file.type });

    loadNewPhoto(photo);
  })
}