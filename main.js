import { processFile, loadNewPhoto } from './modules/operations.js'

// Wait for all resources to load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  main();
});

const main = () => {
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