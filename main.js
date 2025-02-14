import { processFile, loadNewPhoto } from './modules/operations.js'

// Wait for all resources to load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  main();
});

const main = () => {
  const negativeSlider = document.querySelector("#negative-slider");
  const negativeOutput = document.querySelector("#negative-slider-value");
  negativeOutput.innerHTML = negativeSlider.value;
  negativeSlider.oninput = function() {
    negativeOutput.innerHTML = this.value;
  }

  const binarySlider = document.querySelector("#binary-slider");
  const binaryOutput = document.querySelector("#binary-slider-value");
  binaryOutput.innerHTML = binarySlider.value;
  binarySlider.oninput = function() {
    binaryOutput.innerHTML = this.value;
  }

  const brightnessSlider = document.querySelector("#brightness-slider");
  const brightnessOutput = document.querySelector("#brightness-slider-value");
  brightnessOutput.innerHTML = brightnessSlider.value;
  brightnessSlider.oninput = function() {
    brightnessOutput.innerHTML = this.value;
  }
  
  const brightnessButton = document.querySelector('#brightness-btn');
  brightnessButton.addEventListener('click', () => {
    processFile('bright')
  })

  const revertButton = document.querySelector('#prev-state-btn'); 
  revertButton.addEventListener('click', () => {
    processFile('revert')
  })
  
  const unrevertButton = document.querySelector('#next-state-btn'); 
  unrevertButton.addEventListener('click', () => {
    processFile('unrevert')
  })

  const toGrayScaleButton = document.querySelector('#grayScale-btn');
  toGrayScaleButton.addEventListener('click', () => {
    processFile('grayscale');
  })

  const toNegativeButton = document.querySelector('#negative-btn');
  toNegativeButton.addEventListener('click', () => {
    processFile('negative');
  })

  const binaryButton = document.querySelector('#binary-btn');
  binaryButton.addEventListener('click', () => {
    processFile('binary');
  })

  const image = document.querySelector('.image#image');
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
          console.info(file)
          loadNewPhoto(file);
        }
      });
    }
  });

  image.addEventListener('dragleave', (e) => {
    e.target.style.backgroundColor = 'transparent';
  });
}