// State and Data Objects
const state = {
  firstName: '',
  lastName: '',
  xHandle: '',
  photoUrl: null,
  selectedEraId: null
};

const ERAS = {
  sister: {
    label: 'SISTER',
    subtext: 'Frost Children',
    bgImage: 'assets/Frame 2.png',
    textColor: '#CA486B',
    links: {
      apple: 'https://music.apple.com/us/artist/frost-children/1531233075',
      spotify: 'https://open.spotify.com/artist/6m0k0Oaw3s3p7a0xIf7w4O',
      soundcloud: 'https://soundcloud.com/frost-children',
      website: 'https://frostchildren.com/'
    }
  },
  detour: {
    label: 'Detour',
    subtext: 'Kim Petras',
    bgImage: 'assets/Frame 3.png',
    textColor: '#FF5993',
    links: {
      apple: 'https://music.apple.com/us/artist/kim-petras/1269399897',
      spotify: 'https://open.spotify.com/artist/3bZEcqHQseA69uH2u08gOr',
      soundcloud: 'https://soundcloud.com/kimpetras',
      website: 'https://kimpetras.com/'
    }
  },
  worstgirl: {
    label: 'Wor$t Girl in America',
    subtext: 'Slayyyter',
    bgImage: 'assets/Frame 1.png',
    textColor: '#E91214',
    links: {
      apple: 'https://music.apple.com/us/artist/slayyyter/1423233816',
      spotify: 'https://open.spotify.com/artist/0cwlFmXzWdoGz0s0EVlE17',
      soundcloud: 'https://soundcloud.com/slayyyter',
      website: 'https://slayyyter.com/'
    }
  }
};

// DOM Elements
const phases = {
  1: document.getElementById('phase1'),
  2: document.getElementById('phase2'),
  3: document.getElementById('phase3')
};

const form = document.getElementById('dataForm');
const photoUpload = document.getElementById('photoUpload');
const fileUploadText = document.getElementById('fileUploadText');
const uploadLabel = document.getElementById('uploadLabel');
const eraCards = document.querySelectorAll('.era-card');

const canvas = document.getElementById('idCanvas');
const ctx = canvas.getContext('2d');
const idPreview = document.getElementById('idPreview');

const downloadBtn = document.getElementById('downloadBtn');
const startOverBtn = document.getElementById('startOverBtn');

// Event Listeners
photoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    fileUploadText.textContent = file.name;
    uploadLabel.classList.add('has-file');
    // Use FileReader to create a base64 Data URL, which avoids canvas origin tainting
    const reader = new FileReader();
    reader.onload = (event) => {
      state.photoUrl = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    fileUploadText.textContent = 'UPLOAD GLAMOUR SHOT';
    uploadLabel.classList.remove('has-file');
    state.photoUrl = null;
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  state.firstName = document.getElementById('firstName').value.trim();
  state.lastName = document.getElementById('lastName').value.trim();
  state.xHandle = handleInput.value.trim();
  
  if (!state.xHandle.startsWith('@')) {
    state.xHandle = '@' + state.xHandle.replace('@', '');
  }

  showPhase(2);
});

eraCards.forEach(card => {
  card.addEventListener('click', () => {
    state.selectedEraId = card.dataset.era;
    updateGlobalAccent();
    showPhase(3);
    // Add small delay to allow UI to transition
    setTimeout(generateID, 100);
  });
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `popstar-id-${state.firstName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

startOverBtn.addEventListener('click', () => {
  form.reset();
  state.photoUrl = null;
  fileUploadText.textContent = 'Mugshot';
  uploadLabel.classList.remove('has-file');
  document.documentElement.style.setProperty('--active-color', '#FF4D8D');
  showPhase(1);
});

// Handle Input logic
const handleInput = document.getElementById('xHandle');
handleInput.value = '@'; // Add default @

handleInput.addEventListener('input', (e) => {
  if (!handleInput.value.startsWith('@')) {
    handleInput.value = '@' + handleInput.value.replace(/@/g, '');
  }
});

handleInput.addEventListener('keydown', (e) => {
  // Prevent deleting the initial @
  if (e.key === 'Backspace' && handleInput.value.length === 1) {
    e.preventDefault();
  }
});

// Functions
function showPhase(phaseNum) {
  Object.values(phases).forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });
  phases[phaseNum].classList.remove('hidden');
  phases[phaseNum].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateGlobalAccent() {
  const era = ERAS[state.selectedEraId];
  if (!era) return;
  
  // Update global accent color
  document.documentElement.style.setProperty('--active-color', era.textColor);
}

// Utility: Load Image
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Draw the canvas
async function generateID() {
  const era = ERAS[state.selectedEraId];
  if (!era || !state.photoUrl) return;

  try {
    // 1. Load images via Base64 to prevent canvas cross-origin tainting on file:///
    const bgImg = await loadImage(BG_IMAGES[state.selectedEraId]);
    const userImg = await loadImage(state.photoUrl);

    // Ensure fonts are loaded before drawing (browser native FontFace API if supported)
    await document.fonts.ready;

    // Set High-DPI Scaling for Crisp Text Rendering (2x scale for 2024x1276 canvas)
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset in case of regenerate
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.scale(2, 2);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 2. Draw Background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1012, 638);
    ctx.drawImage(bgImg, 0, 0, 1012, 638);

    // 3. Draw User Photo (Crop to 301x386 according to spec)
    const dx = 60;
    const dy = 134; // Shifted up 30px from 164
    const dWidth = 301;
    const dHeight = 386;

    const imgRatio = userImg.width / userImg.height;
    const targetRatio = dWidth / dHeight;
    let sWidth, sHeight, sx, sy;

    if (imgRatio > targetRatio) {
      sHeight = userImg.height;
      sWidth = userImg.height * targetRatio;
      sx = (userImg.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = userImg.width;
      sHeight = userImg.width / targetRatio;
      sx = 0;
      sy = (userImg.height - sHeight) / 2;
    }

    ctx.save();
    ctx.beginPath();
    // Draw sharp rectangle
    ctx.rect(dx, dy, dWidth, dHeight);
    ctx.clip();
    ctx.drawImage(userImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.restore();

    // 4. Draw Text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top'; // Coordinates given assume top baseline drawing
    ctx.fillStyle = era.textColor;

    // "FIRST NAME" Label
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText('FIRST NAME', 391, 338);

    // First Name Value
    ctx.font = '900 60px "Inter", sans-serif'; // Using 900 for 'Black' weight
    ctx.fillText(state.firstName.toUpperCase(), 391, 354);

    // "LAST NAME" Label
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText('LAST NAME', 391, 442);

    // Last Name Value
    ctx.font = '900 60px "Inter", sans-serif';
    ctx.fillText(state.lastName.toUpperCase(), 391, 461);

    // ID Number
    ctx.font = '400 20px "Inter", sans-serif';
    const idNum = Math.floor(Math.random() * 900000000 + 100000000).toString().replace(/(\d{3})(?=\d)/g, '$1-');
    ctx.fillText(`ID NO: ${idNum}`, 391, 560);

    // User X Handle
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText(state.xHandle, 60, 560);

    // 5. Update Preview Image Base64
    idPreview.src = canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error generating canvas:", error);
    alert("There was an error generating your ID.");
  }
}
