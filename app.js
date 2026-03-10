// State and Data Objects
const state = {
  firstName: '',
  lastName: '',
  gender: '',
  xHandle: '',
  photoUrl: null,
  selectedEraId: null
};

const ERAS = {
  sister: {
    label: 'SISTER',
    subtext: 'Frost Children',
    bgImage: 'assets/Frame 2.png',
    textColor: '#A4C600',
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
    textColor: '#FF4D8D',
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
    textColor: '#FF0000',
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

const footerLinks = {
  apple: document.getElementById('linkApple'),
  spotify: document.getElementById('linkSpotify'),
  soundcloud: document.getElementById('linkSoundcloud'),
  website: document.getElementById('linkWebsite')
};

// Event Listeners
photoUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    fileUploadText.textContent = file.name;
    uploadLabel.classList.add('has-file');
    // Create object URL
    if (state.photoUrl) URL.revokeObjectURL(state.photoUrl);
    state.photoUrl = URL.createObjectURL(file);
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
  state.gender = document.getElementById('gender').value;
  state.xHandle = document.getElementById('xHandle').value.trim();
  
  if (!state.xHandle.startsWith('@')) {
    state.xHandle = '@' + state.xHandle;
  }

  showPhase(2);
});

eraCards.forEach(card => {
  card.addEventListener('click', () => {
    state.selectedEraId = card.dataset.era;
    updateFooterLinks();
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
  fileUploadText.textContent = 'UPLOAD GLAMOUR SHOT';
  uploadLabel.classList.remove('has-file');
  document.documentElement.style.setProperty('--active-color', '#FF4D8D');
  showPhase(1);
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

function updateFooterLinks() {
  const era = ERAS[state.selectedEraId];
  if (!era) return;
  
  footerLinks.apple.href = era.links.apple;
  footerLinks.spotify.href = era.links.spotify;
  footerLinks.soundcloud.href = era.links.soundcloud;
  footerLinks.website.href = era.links.website;
  
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
    // 1. Load images
    const bgImg = await loadImage(era.bgImage);
    const userImg = await loadImage(state.photoUrl);

    // Ensure fonts are loaded before drawing (browser native FontFace API if supported)
    await document.fonts.ready;

    // 2. Draw Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    // 3. Draw User Photo (Crop to 300x400)
    const dx = 55;
    const dy = 110;
    const dWidth = 300;
    const dHeight = 400;

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
    // Use fallback for roundRect if not supported by older browsers (Safari < 16)
    if (ctx.roundRect) {
      ctx.roundRect(dx, dy, dWidth, dHeight, 16);
    } else {
      ctx.rect(dx, dy, dWidth, dHeight);
    }
    ctx.clip();
    ctx.drawImage(userImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    ctx.restore();

    // 4. Draw Text
    // Common settings
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Layer 3 (Text - First Name): Draw FirstName
    ctx.fillStyle = era.textColor;
    ctx.font = '900 80px "Inter", sans-serif';
    ctx.shadowColor = era.textColor;
    ctx.shadowBlur = 20;
    ctx.fillText(state.firstName.toUpperCase(), 385, 315);
    ctx.shadowBlur = 0; // Reset shadow

    // Layer 4 (Text - Last Name): Draw LastName
    ctx.fillStyle = era.textColor;
    ctx.font = '900 80px "Inter", sans-serif';
    ctx.shadowColor = era.textColor;
    ctx.shadowBlur = 20;
    ctx.fillText(state.lastName.toUpperCase(), 385, 495);
    ctx.shadowBlur = 0;

    // Layer 5 (Text - Handle): Draw @ + XHandle
    ctx.fillStyle = era.textColor;
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText(state.xHandle, 55, 590);
    ctx.shadowBlur = 0;

    // 5. Update Preview Image Base64
    idPreview.src = canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error generating canvas:", error);
    alert("There was an error generating your ID.");
  }
}
