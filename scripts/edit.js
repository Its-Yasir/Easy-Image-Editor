// 📂 Getting references to all the necessary DOM elements
const fileInput = document.querySelector('.file-input'),
choseImgButton = document.querySelector('.chose-img'),
previewImage = document.querySelector('.preview-img img'),
filterName = document.querySelector('.filter-info .name'),
filterValue = document.querySelector('.filter-info .value'),
filterSlider = document.querySelector('.slider input'),
filterOptions = document.querySelectorAll('.filter button'),
rotateOptions = document.querySelectorAll('.rotate button'),
saveImageBtn = document.querySelector('.save-img'),
redoBox = document.querySelector('.redo-box'),
undoBox = document.querySelector('.undo-box'),
resetFiltersButton = document.querySelector('.reset-filters');

// 🎚️ Filter and transformation variables with default values
let brightness = 100,
    saturation = 100,
    inversion = 0,
    grayscale = 0,
    blurs = 0,           // 🌫️ new blur value
    contrast = 100,
    rotate = 0,
    flipHorizontal = 1,  // ↔️ Horizontal flip (1 = normal, -1 = flipped)
    flipVertical = 1;    // ↕️ Vertical flip (1 = normal, -1 = flipped)

// 📜 To keep track of all changes for Undo/Redo functionality
let changesHistory = [
  {
    id: 0,
    redo:false,
    brightness: 100,
    saturation: 100,
    inversion: 0,
    grayscale: 0,
    blurs: 0,
    contrast: 100,
    rotate: 0,
    flipHorizontal: 1,
    flipVertical: 1
  }
];  

// 🧠 This function applies all filters and transformations to the image
const applyFilter = () => {
  previewImage.style.transform = `rotate(${rotate}deg) scaleX(${flipHorizontal}) scaleY(${flipVertical})`;
  previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blurs}px) contrast(${contrast}%)`;
}

let undoId; // 🕹️ Keeps track of the current undo/redo position

// 📷 Called when the user selects an image file
const loadImage = ()=>{
  let file = fileInput.files[0];
  if(!file) return; // ❌ If no file selected, exit
  previewImage.src = URL.createObjectURL(file); // 🔗 Set image preview source
  previewImage.addEventListener('load', ()=>{ // 🔄 After image loads
    resetFiltersButton.click(); // 🔄 Reset filters
    document.querySelector('.container').classList.remove('disabled'); // ✅ Enable the editor
    changesHistory = [ /* Reset history on new image load */ {
      id: 0,
      redo:false,
      brightness: 100,
      saturation: 100,
      inversion: 0,
      grayscale: 0,
      blurs: 0,
      contrast: 100,
      rotate: 0,
      flipHorizontal: 1,
      flipVertical: 1
    }];
    undoId = 0;
  })
}

// 🎛️ When user clicks on a filter (brightness, saturation, etc.)
filterOptions.forEach(option => {
  option.addEventListener('click',()=>{
    document.querySelector('.filter .active').classList.remove('active');
    option.classList.add('active'); // ✅ Make current filter active
    filterName.textContent = option.textContent;

    // 🎚️ Setup slider based on selected filter
    if(option.id === 'brightness'){
      filterSlider.max = '200';
      filterSlider.value = brightness;
      filterValue.textContent = `${brightness}%`;
    }else if(option.id === 'saturation'){
      filterSlider.max = '200';
      filterSlider.value = saturation;
      filterValue.textContent = `${saturation}%`;
    }else if(option.id === 'inversion'){
      filterSlider.max = '100';
      filterSlider.value = inversion;
      filterValue.textContent = `${inversion}%`;
    }else if(option.id === 'blur'){
      filterSlider.max = '10';
      filterSlider.value = blurs;
      filterValue.textContent = `${blurs}px`;
    }else if(option.id === 'contrast'){
      filterSlider.max = '200';
      filterSlider.value = contrast;
      filterValue.textContent = `${contrast}%`;
    }else{
      filterSlider.max = '100';
      filterSlider.value = grayscale;
      filterValue.textContent = `${grayscale}%`;
    }

    // 🧠 Save current state to history for undo/redo
    changesHistory.push({
      id: changesHistory.length,
      redo: false,
      brightness,
      saturation,
      inversion,
      grayscale,
      blurs,
      contrast,
      rotate,
      flipHorizontal,
      flipVertical
    });
    undoId = changesHistory.length;
  })
})

// 📉 When slider is moved, update the value of selected filter
const updateFilter = ()=>{
  filterValue.textContent = `${filterSlider.value}%`; // ⚠️ Blur should be px – consider improving this
  const selectedFilter = document.querySelector('.filter .active');
  if(selectedFilter){
    if(selectedFilter.id === 'brightness'){
      brightness = Number(filterSlider.value);
    }
    else if(selectedFilter.id === 'saturation'){
      saturation = Number(filterSlider.value);
    }
    else if(selectedFilter.id === 'inversion'){
      inversion = Number(filterSlider.value);
    }
    else if(selectedFilter.id === 'blur'){
      blurs = Number(filterSlider.value);
    }
    else if(selectedFilter.id === 'contrast'){
      contrast = Number(filterSlider.value);
    }
    else if(selectedFilter.id === 'grayscale'){
      grayscale = Number(filterSlider.value);
    }
  }
  applyFilter(); // 🎨 Apply changes visually
}

// 🔄 Handling rotation and flipping buttons
rotateOptions.forEach(option => {
  option.addEventListener('click',()=>{
    if(option.id === 'left'){
      rotate -= 90;
    }else if(option.id === 'right'){
      rotate += 90;
    }else if(option.id === 'horizontal'){
      flipHorizontal *= -1;
    }else if(option.id === 'vertical'){
      flipVertical *= -1;
    }
    applyFilter(); // Update image visually

    // 🧠 Save current transformation state
    changesHistory.push({
      id: changesHistory.length,
      redo: false,
      brightness,
      saturation,
      inversion,
      grayscale,
      blurs,
      contrast,
      rotate,
      flipHorizontal,
      flipVertical
    });
    undoId = changesHistory.length;
  })
})

// 🔙 Undo to previous state
undoBox.addEventListener('click', () => {
  if (undoId - 1 < 0) return; // ⛔ Prevent underflow
  let changesApplied = changesHistory[undoId - 1];
  if(changesApplied){
    brightness = changesApplied.brightness;
    saturation = changesApplied.saturation;
    inversion = changesApplied.inversion;
    grayscale = changesApplied.grayscale;
    blurs = changesApplied.blurs;
    contrast = changesApplied.contrast;
    rotate = changesApplied.rotate;
    flipHorizontal = changesApplied.flipHorizontal;
    flipVertical = changesApplied.flipVertical;
    
    applyFilter();
    
    changesHistory[undoId - 1].redo = true; // 📝 Mark as redone
    undoId--;
  }
});

// 🔁 Redo to next state (if exists)
redoBox.addEventListener('click', () => {
  let changesApplied = changesHistory[undoId + 1];
  if(changesApplied){
    brightness = changesApplied.brightness;
    saturation = changesApplied.saturation;
    inversion = changesApplied.inversion;
    grayscale = changesApplied.grayscale;
    blurs = changesApplied.blurs;
    contrast = changesApplied.contrast;
    rotate = changesApplied.rotate;
    flipHorizontal = changesApplied.flipHorizontal;
    flipVertical = changesApplied.flipVertical;

    applyFilter();

    changesHistory[undoId].redo = true;
    undoId++;
  }
});

// 🧹 Resets all filters and transformations to default
const resetFilter = () => {
  brightness = 100;
  saturation = 100;
  inversion = 0;
  grayscale = 0;
  blurs = 0;           
  contrast = 100;
  rotate = 0;
  flipHorizontal = 1;
  flipVertical = 1;
  filterOptions[0].click();  // 🔘 Select first filter
  applyFilter();             // 🎨 Apply reset visually
}

// 💾 Save the image with all applied filters and transformations
const saveImageFuunction = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = previewImage.naturalWidth;
  canvas.height = previewImage.naturalHeight;

  // 🧠 Apply filters on canvas context
  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blurs}px) contrast(${contrast}%)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotate * Math.PI / 180);
  ctx.scale(flipHorizontal, flipVertical);
  ctx.drawImage(previewImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

  // ⏳ Make sure image is fully loaded before saving
  if (!previewImage.complete || previewImage.naturalWidth === 0) {
    alert('Image not fully loaded!');
    return;
  }

  // 💾 Trigger download
  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL();
  link.click();
}

// ⌨️ Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    undoBox.click(); // Ctrl + Z
  }
  if (e.ctrlKey && e.key === 'y') {
    redoBox.click(); // Ctrl + Y
  }
});

// 📌 Event listeners for basic actions
resetFiltersButton.addEventListener('click', resetFilter);
fileInput.addEventListener('change', loadImage);
saveImageBtn.addEventListener('click', saveImageFuunction);
filterSlider.addEventListener('input', updateFilter);
choseImgButton.addEventListener('click', () => {
  fileInput.click(); // 📁 Trigger file input when button is clicked
});
