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

let brightness = 100,
    saturation = 100,
    inversion = 0,
    grayscale = 0,
    blurs = 0,           // 👈 new
    contrast = 100,
    rotate = 0,
    flipHorizontal = 1,
    flipVertical = 1;

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

const applyFilter = () => {
  previewImage.style.transform = `rotate(${rotate}deg) scaleX(${flipHorizontal}) scaleY(${flipVertical})`;
  previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blurs}px) contrast(${contrast}%)`;
  
}

const loadImage = ()=>{
  let file = fileInput.files[0];
  if(!file) return;
  previewImage.src = URL.createObjectURL(file);
  previewImage.addEventListener('load', ()=>{
    resetFiltersButton.click();
    document.querySelector('.container').classList.remove('disabled');
    changesHistory = [
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
  })
  console.log(file);
}


let undoId;

filterOptions.forEach(option => {
  option.addEventListener('click',()=>{
    document.querySelector('.filter .active').classList.remove('active');
    option.classList.add('active');
    filterName.textContent = option.textContent;
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

const updateFilter = ()=>{
  filterValue.textContent = `${filterSlider.value}%`;
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
  applyFilter();
}

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
    applyFilter();
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

undoBox.addEventListener('click', () => {
  let changesApplied = changesHistory[undoId - 1];
  if(changesApplied){
    console.log(changesApplied);
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
    
    changesHistory[undoId - 1].redo = true; // Mark as redone
    undoId--;
  }
});


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

    changesHistory[undoId].redo = true; // Mark as redone
    undoId++;
  }
});

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
  filterOptions[0].click(); 
  applyFilter();
}
const saveImageFuunction = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = previewImage.naturalWidth;
  canvas.height = previewImage.naturalHeight;
  ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%) blur(${blurs}px) contrast(${contrast}%)`;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotate * Math.PI / 180);
  ctx.scale(flipHorizontal, flipVertical);
  ctx.drawImage(previewImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  
  const link = document.createElement('a');
  link.download = 'edited-image.png';
  link.href = canvas.toDataURL();
  link.click();
}

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'z') {
    undoBox.click();
  }
  if (e.ctrlKey && e.key === 'y') {
    redoBox.click();
  }
});

resetFiltersButton.addEventListener('click',resetFilter);
fileInput.addEventListener('change', loadImage);
saveImageBtn.addEventListener('click', saveImageFuunction);
filterSlider.addEventListener('input',updateFilter);
choseImgButton.addEventListener('click', () => {
  fileInput.click();
});