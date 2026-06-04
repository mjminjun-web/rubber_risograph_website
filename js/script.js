// Image Gallery Script
console.log("Image gallery loaded successfully!");

// Welcome Modal
document.addEventListener("DOMContentLoaded", function () {
  const welcomeModal = document.getElementById("welcomeModal");
  const closeWelcomeBtn = document.getElementById("closeWelcome");
  const viewPrintsBtn = document.getElementById("viewPrintsBtn");

  // Check if user has seen the welcome message before
  const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");

  if (hasSeenWelcome) {
    // Hide welcome modal if already seen
    welcomeModal.style.display = "none";
  } else {
    // Show welcome modal
    welcomeModal.style.display = "block";
  }

  // Close welcome modal when close button is clicked
  if (closeWelcomeBtn) {
    closeWelcomeBtn.addEventListener("click", function () {
      welcomeModal.style.display = "none";
      sessionStorage.setItem("hasSeenWelcome", "true");
    });
  }

  // Close modal and scroll to gallery when View Prints button is clicked
  if (viewPrintsBtn) {
    viewPrintsBtn.addEventListener("click", function () {
      welcomeModal.style.display = "none";
      sessionStorage.setItem("hasSeenWelcome", "true");
      // Scroll to the gallery section
      const galleryContainer = document.getElementById("galleryContainer");
      if (galleryContainer) {
        galleryContainer.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Also close if user clicks outside the modal
  welcomeModal.addEventListener("click", function (e) {
    if (e.target === welcomeModal) {
      welcomeModal.style.display = "none";
      sessionStorage.setItem("hasSeenWelcome", "true");
    }
  });

  // Close welcome modal when ESC key is pressed
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && welcomeModal.style.display === "block") {
      welcomeModal.style.display = "none";
      sessionStorage.setItem("hasSeenWelcome", "true");
    }
  });

  // About project modal
  const aboutModal = document.getElementById("aboutModal");
  const aboutProjectBtn = document.getElementById("aboutProjectBtn");
  const closeAboutBtn = document.getElementById("closeAbout");

  if (aboutProjectBtn) {
    aboutProjectBtn.addEventListener("click", function () {
      aboutModal.style.display = "block";
    });
  }

  if (closeAboutBtn) {
    closeAboutBtn.addEventListener("click", function () {
      aboutModal.style.display = "none";
    });
  }

  if (aboutModal) {
    aboutModal.addEventListener("click", function (e) {
      if (e.target === aboutModal) {
        aboutModal.style.display = "none";
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && aboutModal.style.display === "block") {
        aboutModal.style.display = "none";
      }
    });
  }
});

// Toggle between scroll and grid view (Grid is default now)
const toggleButton = document.getElementById("toggleView");
const galleryContainer = document.getElementById("galleryContainer");

let isScrollView = false;

const a = 4;

toggleButton.addEventListener("click", function () {
  isScrollView = !isScrollView;

  if (isScrollView) {
    galleryContainer.classList.add("scroll-view");
    toggleButton.textContent = "Switch to Grid View";
    // Change button to active state (black background)
    toggleButton.style.backgroundColor = "#000";
    toggleButton.style.borderColor = "#000";
    toggleButton.style.color = "#fff";
  } else {
    galleryContainer.classList.remove("scroll-view");
    toggleButton.textContent = "Switch to Scroll View";
    // Reset button to default state
    toggleButton.style.backgroundColor = "#fff";
    toggleButton.style.borderColor = "#e5e5e5";
    toggleButton.style.color = "#171717";
  }
});

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message) {
  const existing = document.getElementById('risoToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'risoToast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #171717;
    color: #fff;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// RISOGRAPH PRINT SIMULATOR
// ============================================

// Authentic Risograph ink colors (CMYK-like primaries + special colors)
const RISO_COLORS = {
  "fluorescent-pink":   { r: 255, g: 110, b: 150, name: "Fluorescent Pink" },
  "fluorescent-orange": { r: 255, g: 116, b: 20,  name: "Fluorescent Orange" },
  sunflower:            { r: 255, g: 185, b: 0,   name: "Sunflower" },
  yellow:               { r: 255, g: 230, b: 20,  name: "Yellow" },
  "light-lime":         { r: 177, g: 210, b: 53,  name: "Light Lime" },
  green:                { r: 0,   g: 154, b: 75,  name: "Green" },
  teal:                 { r: 0,   g: 161, b: 154, name: "Teal" },
  aqua:                 { r: 0,   g: 162, b: 210, name: "Aqua" },
  "sky-blue":           { r: 98,  g: 185, b: 220, name: "Sky Blue" },
  blue:                 { r: 0,   g: 100, b: 175, name: "Blue" },
  violet:               { r: 87,  g: 40,  b: 140, name: "Violet" },
  purple:               { r: 102, g: 55,  b: 132, name: "Purple" },
  burgundy:             { r: 134, g: 43,  b: 74,  name: "Burgundy" },
  red:                  { r: 240, g: 58,  b: 40,  name: "Red" },
  scarlet:              { r: 228, g: 60,  b: 48,  name: "Scarlet" },
  "bright-red":         { r: 240, g: 46,  b: 56,  name: "Bright Red" },
  black:                { r: 30,  g: 28,  b: 28,  name: "Black" },
};

class ColorMixer {
  constructor() {
    this.canvas = document.getElementById("mainCanvas");
    this.ctx = this.canvas.getContext("2d");

    // Images with transform properties
    this.image1 = null;
    this.image2 = null;
    this.opacity1 = 1.0;
    this.opacity2 = 1.0;

    // Transform properties for each image
    this.img1Props = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      hue: 0,
      offsetX: 0,
      offsetY: 0,
      risoColor: null,
    };
    this.img2Props = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      hue: 0,
      offsetX: 0,
      offsetY: 0,
      risoColor: null,
    };

    // Risograph effects
    this.grainIntensity = 0.15;
    this.halftoneEnabled = true;
    this.paperTexture = true;
    this.separationMode = false;

    // Paper tone
    this.paperTone = '#ede8d5';

    // Blend mode
    this.blendMode = "multiply"; // Default to multiply for authentic riso look

    // Drag state
    this.isDragging = false;
    this.dragImage = null;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Color extraction
    this.colors1 = [];
    this.colors2 = [];

    // Create halftone pattern
    this.halftonePattern = this.createHalftonePattern();

    // Fill canvas with initial paper tone before images are loaded
    this.ctx.fillStyle = this.paperTone;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.init();
  }

  init() {
    document
      .getElementById("selectImage1")
      .addEventListener("click", () => this.showPicker(1));
    document
      .getElementById("selectImage2")
      .addEventListener("click", () => this.showPicker(2));

    // Make preview slots clickable too
    document
      .getElementById("preview1")
      .addEventListener("click", () => this.showPicker(1));
    document
      .getElementById("preview2")
      .addEventListener("click", () => this.showPicker(2));

    // Opacity sliders
    document.getElementById("opacity1Slider").addEventListener("input", (e) => {
      this.opacity1 = e.target.value / 100;
      document.getElementById("opacity1Value").textContent =
        e.target.value + "%";
      this.render();
    });

    document.getElementById("opacity2Slider").addEventListener("input", (e) => {
      this.opacity2 = e.target.value / 100;
      document.getElementById("opacity2Value").textContent =
        e.target.value + "%";
      this.render();
    });

    // File upload handlers
    document.getElementById("uploadImage1Btn").addEventListener("click", () => {
      document.getElementById("uploadImage1").click();
    });
    document.getElementById("uploadImage2Btn").addEventListener("click", () => {
      document.getElementById("uploadImage2").click();
    });

    document.getElementById("uploadImage1").addEventListener("change", (e) => {
      this.handleFileUpload(e, 1);
    });
    document.getElementById("uploadImage2").addEventListener("change", (e) => {
      this.handleFileUpload(e, 2);
    });

    document
      .getElementById("clearBtn")
      .addEventListener("click", () => this.clear());
    document
      .getElementById("saveBtn")
      .addEventListener("click", () => this.save());

    // Picker
    document
      .getElementById("closeImagePicker")
      .addEventListener("click", () => this.hidePicker());
    document
      .getElementById("imagePickerOverlay")
      .addEventListener("click", (e) => {
        if (e.target.id === "imagePickerOverlay") this.hidePicker();
      });

    // Canvas mouse events for dragging
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.onMouseUp());

    // Keyboard events for rotation
    document.addEventListener("keydown", (e) => this.onKeyDown(e));

    // Mobile rotation buttons
    const rotateImg1Left = document.getElementById("rotateImg1Left");
    const rotateImg1Right = document.getElementById("rotateImg1Right");
    const rotateImg2Left = document.getElementById("rotateImg2Left");
    const rotateImg2Right = document.getElementById("rotateImg2Right");
    if (rotateImg1Left) rotateImg1Left.addEventListener("click", () => this.rotateImage(1, -1));
    if (rotateImg1Right) rotateImg1Right.addEventListener("click", () => this.rotateImage(1, 1));
    if (rotateImg2Left) rotateImg2Left.addEventListener("click", () => this.rotateImage(2, -1));
    if (rotateImg2Right) rotateImg2Right.addEventListener("click", () => this.rotateImage(2, 1));

    // Fun Effects buttons
    document
      .getElementById("randomDotsBtn")
      .addEventListener("click", () => this.drawRandomDots());
    document
      .getElementById("randomLinesBtn")
      .addEventListener("click", () => this.drawRandomLines());
    document
      .getElementById("mixColorsBtn")
      .addEventListener("click", () => this.drawColorMix());

    // Riso color selectors
    document
      .getElementById("risoColor1Select")
      .addEventListener("change", (e) => {
        this.img1Props.risoColor = e.target.value || null;
        this.render();
      });
    document
      .getElementById("risoColor2Select")
      .addEventListener("change", (e) => {
        this.img2Props.risoColor = e.target.value || null;
        this.render();
      });

    // Offset sliders for Image 1
    document.getElementById("offsetX1Slider").addEventListener("input", (e) => {
      this.img1Props.offsetX = parseInt(e.target.value);
      document.getElementById("offsetX1Value").textContent = e.target.value;
      this.render();
    });
    document.getElementById("offsetY1Slider").addEventListener("input", (e) => {
      this.img1Props.offsetY = parseInt(e.target.value);
      document.getElementById("offsetY1Value").textContent = e.target.value;
      this.render();
    });

    // Offset sliders for Image 2
    document.getElementById("offsetX2Slider").addEventListener("input", (e) => {
      this.img2Props.offsetX = parseInt(e.target.value);
      document.getElementById("offsetX2Value").textContent = e.target.value;
      this.render();
    });
    document.getElementById("offsetY2Slider").addEventListener("input", (e) => {
      this.img2Props.offsetY = parseInt(e.target.value);
      document.getElementById("offsetY2Value").textContent = e.target.value;
      this.render();
    });

    // Blend mode selector
    document
      .getElementById("blendModeSelect")
      .addEventListener("change", (e) => {
        this.blendMode = e.target.value;
        this.render();
      });

    // Surprise Me button
    document
      .getElementById("surpriseMeBtn")
      .addEventListener("click", () => this.surpriseMe());

    // Separation mode toggle
    document
      .getElementById("separationModeBtn")
      .addEventListener("click", () => this.toggleSeparationMode());

    // Paper tone selector
    const paperTones = {
      'warm-white': '#f5f0e8',
      'cream':      '#ede8d5',
      'newsprint':  '#e0d9c0',
      'pale-pink':  '#eed8d0',
      'light-blue': '#d4e4ea',
      'kraft':      '#c8b48a',
    };
    document.getElementById("paperToneSelect").addEventListener("change", (e) => {
      this.paperTone = paperTones[e.target.value] || '#ede8d5';
      this.render();
    });

    // Grain intensity slider
    document.getElementById("grainSlider").addEventListener("input", (e) => {
      this.grainIntensity = e.target.value / 100;
      document.getElementById("grainValue").textContent = e.target.value + "%";
      this.render();
    });

    // Halftone toggle
    document.getElementById("halftoneToggle").addEventListener("click", () => {
      this.halftoneEnabled = !this.halftoneEnabled;
      const btn = document.getElementById("halftoneToggle");
      btn.textContent = this.halftoneEnabled ? "Halftone: ON" : "Halftone: OFF";
      if (this.halftoneEnabled) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
      this.render();
    });

    // Misregistration preset buttons
    document.querySelectorAll(".misreg-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.target.getAttribute("data-preset");
        this.applyMisregistrationPreset(preset);
      });
    });

    // Touch events for mobile dragging
    this.canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), {
      passive: false,
    });
    this.canvas.addEventListener("touchend", () => this.onTouchEnd());

    this.render();
    this.loadDefaults();
  }

  loadDefaults() {
    let loadedCount = 0;
    const onBothLoaded = () => {
      this.img1Props.risoColor = 'fluorescent-pink';
      this.img2Props.risoColor = 'blue';
      this.img2Props.offsetX = 18;
      this.img2Props.offsetY = -12;
      this.blendMode = 'multiply';
      document.getElementById('risoColor1Select').value = 'fluorescent-pink';
      document.getElementById('risoColor2Select').value = 'blue';
      document.getElementById('blendModeSelect').value = 'multiply';
      document.getElementById('offsetX2Slider').value = 18;
      document.getElementById('offsetX2Value').textContent = '18';
      document.getElementById('offsetY2Slider').value = -12;
      document.getElementById('offsetY2Value').textContent = '-12';
      this.render();
      this.updateColorPalette();
      this.updateEmptyState();
      showToast('Try the ← → sliders to shift layers apart');
    };

    const loadImg = (src, slot) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try { await img.decode(); } catch(e) {}
        if (slot === 1) {
          this.image1 = img;
          this.colors1 = this.extractColors(img);
          this.img1Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0, risoColor: null };
          this.updatePreviewSlot(1, src);
        } else {
          this.image2 = img;
          this.colors2 = this.extractColors(img);
          this.img2Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0, risoColor: null };
          this.updatePreviewSlot(2, src);
        }
        loadedCount++;
        if (loadedCount === 2) onBothLoaded();
      };
      img.src = src;
    };

    loadImg('images/image_1.png', 1);
    loadImg('images/image_3.png', 2);
  }

  rotateImage(imageNum, direction) {
    const rotationStep = Math.PI / 36; // 5 degrees
    if (imageNum === 1 && this.image1) {
      this.img1Props.rotation += direction * rotationStep;
      this.render();
    } else if (imageNum === 2 && this.image2) {
      this.img2Props.rotation += direction * rotationStep;
      this.render();
    }
  }

  showPicker(slot) {
    this.currentSlot = slot;
    const grid = document.getElementById("imagePickerGrid");
    grid.innerHTML = "";

    // Use data-src pattern for lazy loading in picker
    document.querySelectorAll("#galleryContainer img").forEach((img, index) => {
      const thumb = document.createElement("img");
      // Load first 12 images immediately, rest lazily
      if (index < 12) {
        thumb.src = img.src;
      } else {
        thumb.dataset.src = img.src;
        thumb.loading = "lazy";
      }
      thumb.decoding = "async";
      thumb.addEventListener("click", () => {
        this.loadImage(img.src, slot);
        this.hidePicker();
      });
      grid.appendChild(thumb);
    });

    // Lazy load remaining images
    this.lazyLoadPickerImages();

    document.getElementById("imagePickerOverlay").classList.remove("hidden");
  }

  lazyLoadPickerImages() {
    const lazyImages = document.querySelectorAll(
      "#imagePickerGrid img[data-src]"
    );

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
    }
  }

  hidePicker() {
    document.getElementById("imagePickerOverlay").classList.add("hidden");
  }

  loadImage(src, slot) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.loading = "eager";

    // Optimize image loading with decode()
    img.onload = async () => {
      try {
        // Decode the image before using it for faster rendering
        await img.decode();
      } catch (e) {
        console.log("Image decode not supported, using standard loading");
      }

      if (slot === 1) {
        this.image1 = img;
        this.colors1 = this.extractColors(img);
        this.img1Props = {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          hue: 0,
          offsetX: 0,
          offsetY: 0,
        };
        this.updatePreviewSlot(1, src);
      } else {
        this.image2 = img;
        this.colors2 = this.extractColors(img);
        this.img2Props = {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          hue: 0,
          offsetX: 0,
          offsetY: 0,
        };
        this.updatePreviewSlot(2, src);
      }
      this.render();
      this.updateColorPalette();
      this.updateEmptyState();
    };

    // Set src after onload for better performance
    img.src = src;
  }

  updatePreviewSlot(slot, src) {
    const previewSlot = document.getElementById(`preview${slot}`);
    previewSlot.innerHTML = `<img src="${src}" alt="Image ${slot}">`;
    previewSlot.setAttribute("data-empty", "false");
  }

  updateEmptyState() {
    const emptyState = document.getElementById("emptyCanvasState");
    if (this.image1 || this.image2) {
      emptyState.classList.add("hidden");
    } else {
      emptyState.classList.remove("hidden");
    }
  }

  handleFileUpload(event, slot) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.loadImage(e.target.result, slot);
      };
      reader.readAsDataURL(file);
    }
  }

  // Extract random colors from image (optimized)
  extractColors(img) {
    // Use smaller canvas for faster processing
    const maxSize = 200;
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = img.width * scale;
    tempCanvas.height = img.height * scale;
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    const colors = [];
    const imageData = tempCtx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );
    const data = imageData.data;

    // Pick 30 random colors (reduced from 50 for better performance)
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * tempCanvas.width);
      const y = Math.floor(Math.random() * tempCanvas.height);
      const idx = (y * tempCanvas.width + x) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      colors.push({ r, g, b });
    }

    return colors;
  }

  updateColorPalette() {
    const palette1 = document.getElementById("palette1");
    const palette2 = document.getElementById("palette2");

    palette1.innerHTML = "";
    palette2.innerHTML = "";

    // Remove collapsed class to show palettes
    palette1.classList.remove("collapsed");
    palette2.classList.remove("collapsed");

    this.colors1.slice(0, 10).forEach((c) => {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.background = `rgb(${c.r},${c.g},${c.b})`;
      palette1.appendChild(swatch);
    });

    this.colors2.slice(0, 10).forEach((c) => {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.background = `rgb(${c.r},${c.g},${c.b})`;
      palette2.appendChild(swatch);
    });

    // Auto-collapse palettes after 5 seconds
    clearTimeout(this.paletteTimeout1);
    clearTimeout(this.paletteTimeout2);

    this.paletteTimeout1 = setTimeout(() => {
      palette1.classList.add("collapsed");
    }, 5000);

    this.paletteTimeout2 = setTimeout(() => {
      palette2.classList.add("collapsed");
    }, 5000);
  }

  createHalftonePattern() {
    const cellSize = 6;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = cellSize;
    patternCanvas.height = cellSize;
    const pCtx = patternCanvas.getContext("2d");

    const cx = cellSize / 2;
    const cy = cellSize / 2;
    const radius = cellSize * 0.28;

    pCtx.fillStyle = "rgba(0, 0, 0, 0.20)";
    pCtx.beginPath();
    pCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    pCtx.fill();

    return this.ctx.createPattern(patternCanvas, "repeat");
  }

  applyRisoColorTint(imageData, risoColor, paperColor) {
    if (!risoColor) return imageData;

    const data = imageData.data;
    const color = RISO_COLORS[risoColor];

    const paper = paperColor || '#ede8d5';
    const pr = parseInt(paper.slice(1, 3), 16);
    const pg = parseInt(paper.slice(3, 5), 16);
    const pb = parseInt(paper.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const inkDensity = Math.pow(1 - lum / 255, 1.4);

      const noise = (Math.random() - 0.5) * 20;
      const density = Math.min(1, Math.max(0, inkDensity + noise / 255));

      data[i]     = Math.round(pr + (color.r - pr) * density);
      data[i + 1] = Math.round(pg + (color.g - pg) * density);
      data[i + 2] = Math.round(pb + (color.b - pb) * density);
    }

    return imageData;
  }

  toggleSeparationMode() {
    this.separationMode = !this.separationMode;
    const btn = document.getElementById("separationModeBtn");
    if (btn) {
      btn.innerHTML = this.separationMode
        ? '<span class="btn-icon">👁️</span> Combined View'
        : '<span class="btn-icon">👁️</span> See each layer';
    }
    this.render();
  }

  render() {
    if (this.separationMode) {
      this.renderSeparated();
    } else {
      this.renderCombined();
    }
  }

  renderSeparated() {
    // Show each color layer separately side by side
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.paperTone || '#ede8d5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const halfWidth = this.canvas.width / 2;

    // Draw layer 1 on left half
    if (this.image1) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, halfWidth, this.canvas.height);
      this.ctx.clip();

      this.ctx.fillStyle = this.paperTone;
      this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
      if (this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = 0.03;
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
        this.ctx.globalAlpha = 1;
      }

      this.ctx.globalAlpha = this.opacity1;
      this.ctx.globalCompositeOperation = "source-over";

      // Scale down to fit in half
      const tempProps = { ...this.img1Props };
      tempProps.x = tempProps.x - this.canvas.width / 4;
      tempProps.scale = tempProps.scale * 0.5;
      this.drawImageWithTransform(this.image1, tempProps);

      if (this.grainIntensity > 0 && this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = this.grainIntensity * this.opacity1;
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
      }

      this.ctx.restore();

      // Label
      this.ctx.fillStyle = "#333";
      this.ctx.font = "bold 16px sans-serif";
      this.ctx.fillText("Layer 1", 10, 30);
      if (this.img1Props.risoColor) {
        this.ctx.fillText(RISO_COLORS[this.img1Props.risoColor].name, 10, 50);
      }
    }

    // Draw divider line
    this.ctx.strokeStyle = "#ccc";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(halfWidth, 0);
    this.ctx.lineTo(halfWidth, this.canvas.height);
    this.ctx.stroke();

    // Draw layer 2 on right half
    if (this.image2) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(halfWidth, 0, halfWidth, this.canvas.height);
      this.ctx.clip();

      this.ctx.fillStyle = this.paperTone;
      this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
      if (this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = 0.03;
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
        this.ctx.globalAlpha = 1;
      }

      this.ctx.globalAlpha = this.opacity2;
      this.ctx.globalCompositeOperation = "source-over";

      // Scale down to fit in half
      const tempProps = { ...this.img2Props };
      tempProps.x = tempProps.x + this.canvas.width / 4;
      tempProps.scale = tempProps.scale * 0.5;
      this.drawImageWithTransform(this.image2, tempProps);

      if (this.grainIntensity > 0 && this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = this.grainIntensity * this.opacity2;
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
      }

      this.ctx.restore();

      // Label
      this.ctx.fillStyle = "#333";
      this.ctx.font = "bold 16px sans-serif";
      this.ctx.fillText("Layer 2", halfWidth + 10, 30);
      if (this.img2Props.risoColor) {
        this.ctx.fillText(
          RISO_COLORS[this.img2Props.risoColor].name,
          halfWidth + 10,
          50
        );
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = "source-over";
  }

  renderCombined() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const paperColor = this.paperTone || '#ede8d5';
    this.ctx.fillStyle = paperColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Paper grain under images
    if (this.halftonePattern) {
      this.ctx.globalAlpha = 0.07;
      this.ctx.fillStyle = this.halftonePattern;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
    }

    if (this.image1) {
      this.ctx.globalAlpha = this.opacity1;
      this.ctx.globalCompositeOperation = "multiply";
      this.drawImageWithTransform(this.image1, this.img1Props);

      if (this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = this.grainIntensity * 0.9;
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    if (this.image2) {
      this.ctx.globalAlpha = this.opacity2;
      this.ctx.globalCompositeOperation = this.blendMode;
      this.drawImageWithTransform(this.image2, this.img2Props);

      if (this.halftoneEnabled && this.halftonePattern) {
        this.ctx.globalAlpha = this.grainIntensity * 0.9;
        this.ctx.globalCompositeOperation = "multiply";
        this.ctx.fillStyle = this.halftonePattern;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    // Final grain pass unifies layers like real paper
    if (this.halftonePattern) {
      this.ctx.globalAlpha = 0.04;
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.fillStyle = this.halftonePattern;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = "source-over";
  }

  drawImageWithTransform(img, props) {
    this.ctx.save();

    // Calculate initial centered position if not set
    const scale =
      Math.min(this.canvas.width / img.width, this.canvas.height / img.height) *
      0.8;
    const w = img.width * scale;
    const h = img.height * scale;
    const centerX = this.canvas.width / 2 + props.x + props.offsetX;
    const centerY = this.canvas.height / 2 + props.y + props.offsetY;

    // Apply transforms
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(props.rotation);
    this.ctx.scale(props.scale, props.scale);

    // If riso color is selected, apply color tinting
    if (props.risoColor) {
      // Create temporary canvas for color manipulation
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = w;
      tempCanvas.height = h;
      const tempCtx = tempCanvas.getContext("2d");

      // Draw image to temp canvas
      tempCtx.drawImage(img, 0, 0, w, h);

      // Get image data and apply riso color tint
      const imageData = tempCtx.getImageData(0, 0, w, h);
      this.applyRisoColorTint(imageData, props.risoColor, this.paperTone);
      tempCtx.putImageData(imageData, 0, 0);

      // Draw tinted image
      this.ctx.drawImage(tempCanvas, -w / 2, -h / 2, w, h);
    } else {
      // Apply hue rotation filter if needed (only when not using riso colors)
      if (props.hue !== 0) {
        this.ctx.filter = `hue-rotate(${props.hue}deg)`;
      }

      // Draw image centered at origin
      this.ctx.drawImage(img, -w / 2, -h / 2, w, h);

      // Reset filter
      this.ctx.filter = "none";
    }

    this.ctx.restore();
  }

  // Mouse handlers for dragging
  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on image 2 first (top layer)
    if (this.image2 && this.isPointInImage(x, y, this.image2, this.img2Props)) {
      this.isDragging = true;
      this.dragImage = 2;
      this.dragStartX = x - this.img2Props.x;
      this.dragStartY = y - this.img2Props.y;
      this.canvas.style.cursor = "grabbing";
    } else if (
      this.image1 &&
      this.isPointInImage(x, y, this.image1, this.img1Props)
    ) {
      this.isDragging = true;
      this.dragImage = 1;
      this.dragStartX = x - this.img1Props.x;
      this.dragStartY = y - this.img1Props.y;
      this.canvas.style.cursor = "grabbing";
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isDragging) {
      if (this.dragImage === 1) {
        this.img1Props.x = x - this.dragStartX;
        this.img1Props.y = y - this.dragStartY;
      } else if (this.dragImage === 2) {
        this.img2Props.x = x - this.dragStartX;
        this.img2Props.y = y - this.dragStartY;
      }
      this.render();
    } else {
      // Change cursor if hovering over an image
      if (
        (this.image2 &&
          this.isPointInImage(x, y, this.image2, this.img2Props)) ||
        (this.image1 && this.isPointInImage(x, y, this.image1, this.img1Props))
      ) {
        this.canvas.style.cursor = "grab";
      } else {
        this.canvas.style.cursor = "default";
      }
    }
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragImage = null;
    this.canvas.style.cursor = "default";
  }

  isPointInImage(x, y, img, props) {
    const scale =
      Math.min(this.canvas.width / img.width, this.canvas.height / img.height) *
      0.8;
    const w = img.width * scale * props.scale;
    const h = img.height * scale * props.scale;
    const centerX = this.canvas.width / 2 + props.x;
    const centerY = this.canvas.height / 2 + props.y;

    // Simple bounding box check (not accounting for rotation for simplicity)
    return (
      x >= centerX - w / 2 &&
      x <= centerX + w / 2 &&
      y >= centerY - h / 2 &&
      y <= centerY + h / 2
    );
  }

  // Keyboard handler for rotation
  onKeyDown(e) {
    if (!this.image1 && !this.image2) return;

    const rotationStep = Math.PI / 36; // 5 degrees

    if (e.key === "q" || e.key === "Q") {
      // Rotate image 1 counter-clockwise
      if (this.image1) {
        this.img1Props.rotation -= rotationStep;
        this.render();
      }
    } else if (e.key === "e" || e.key === "E") {
      // Rotate image 1 clockwise
      if (this.image1) {
        this.img1Props.rotation += rotationStep;
        this.render();
      }
    } else if (e.key === "a" || e.key === "A") {
      // Rotate image 2 counter-clockwise
      if (this.image2) {
        this.img2Props.rotation -= rotationStep;
        this.render();
      }
    } else if (e.key === "d" || e.key === "D") {
      // Rotate image 2 clockwise
      if (this.image2) {
        this.img2Props.rotation += rotationStep;
        this.render();
      }
    }
  }

  // Touch event handlers for mobile
  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Check if touching image 2 first (top layer)
    if (this.image2 && this.isPointInImage(x, y, this.image2, this.img2Props)) {
      this.isDragging = true;
      this.dragImage = 2;
      this.dragStartX = x - this.img2Props.x;
      this.dragStartY = y - this.img2Props.y;
    } else if (
      this.image1 &&
      this.isPointInImage(x, y, this.image1, this.img1Props)
    ) {
      this.isDragging = true;
      this.dragImage = 1;
      this.dragStartX = x - this.img1Props.x;
      this.dragStartY = y - this.img1Props.y;
    }
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (this.dragImage === 1) {
      this.img1Props.x = x - this.dragStartX;
      this.img1Props.y = y - this.dragStartY;
    } else if (this.dragImage === 2) {
      this.img2Props.x = x - this.dragStartX;
      this.img2Props.y = y - this.dragStartY;
    }
    this.render();
  }

  onTouchEnd() {
    this.isDragging = false;
    this.dragImage = null;
  }

  // Fun effects using extracted colors
  drawRandomDots() {
    const allColors = [...this.colors1, ...this.colors2];
    if (allColors.length === 0) {
      alert("Please select images first to extract colors!");
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < 200; i++) {
      const c = allColors[Math.floor(Math.random() * allColors.length)];
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 40 + 10;

      this.ctx.globalAlpha = Math.random() * 0.7 + 0.3;
      this.ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  drawRandomLines() {
    const allColors = [...this.colors1, ...this.colors2];
    if (allColors.length === 0) {
      alert("Please select images first to extract colors!");
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < 100; i++) {
      const c = allColors[Math.floor(Math.random() * allColors.length)];

      this.ctx.strokeStyle = `rgb(${c.r},${c.g},${c.b})`;
      this.ctx.lineWidth = Math.random() * 8 + 2;
      this.ctx.globalAlpha = Math.random() * 0.6 + 0.4;

      this.ctx.beginPath();
      this.ctx.moveTo(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      );
      this.ctx.lineTo(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      );
      this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
  }

  drawColorMix() {
    const allColors = [...this.colors1, ...this.colors2];
    if (allColors.length === 0) {
      alert("Please select images first to extract colors!");
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Create gradient stripes
    const stripeWidth = this.canvas.width / 20;

    for (let i = 0; i < 20; i++) {
      const c = allColors[Math.floor(Math.random() * allColors.length)];
      this.ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      this.ctx.fillRect(i * stripeWidth, 0, stripeWidth, this.canvas.height);
    }

    // Add some blended circles on top
    for (let i = 0; i < 30; i++) {
      const c = allColors[Math.floor(Math.random() * allColors.length)];
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 100 + 50;

      this.ctx.globalAlpha = 0.4;
      this.ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  applyMisregistrationPreset(preset) {
    if (!this.image1 || !this.image2) {
      alert("Please load both images first!");
      return;
    }

    switch (preset) {
      case "subtle":
        this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 10);
        this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 10);
        this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 10);
        this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 10);
        break;
      case "moderate":
        this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 30);
        this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 30);
        this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 30);
        this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 30);
        break;
      case "extreme":
        this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 80);
        this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 80);
        this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 80);
        this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 80);
        break;
      case "horizontal":
        this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 50);
        this.img1Props.offsetY = 0;
        this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 50);
        this.img2Props.offsetY = 0;
        break;
      case "vertical":
        this.img1Props.offsetX = 0;
        this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 50);
        this.img2Props.offsetX = 0;
        this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 50);
        break;
    }

    this.updateOffsetUI();
    this.render();
  }

  updateOffsetUI() {
    document.getElementById("offsetX1Slider").value = this.img1Props.offsetX;
    document.getElementById("offsetX1Value").textContent =
      this.img1Props.offsetX;
    document.getElementById("offsetY1Slider").value = this.img1Props.offsetY;
    document.getElementById("offsetY1Value").textContent =
      this.img1Props.offsetY;
    document.getElementById("offsetX2Slider").value = this.img2Props.offsetX;
    document.getElementById("offsetX2Value").textContent =
      this.img2Props.offsetX;
    document.getElementById("offsetY2Slider").value = this.img2Props.offsetY;
    document.getElementById("offsetY2Value").textContent =
      this.img2Props.offsetY;
  }

  surpriseMe() {
    if (!this.image1 || !this.image2) {
      alert("Please load both images first!");
      return;
    }

    // Pick random authentic riso colors for each layer
    const risoColorKeys = Object.keys(RISO_COLORS);
    this.img1Props.risoColor =
      risoColorKeys[Math.floor(Math.random() * risoColorKeys.length)];
    this.img2Props.risoColor =
      risoColorKeys[Math.floor(Math.random() * risoColorKeys.length)];

    // Random rotations (smaller for more authentic look)
    this.img1Props.rotation = (Math.random() - 0.5) * Math.PI * 0.2; // ±18 degrees
    this.img2Props.rotation = (Math.random() - 0.5) * Math.PI * 0.2;

    // Random misregistration (authentic riso-style)
    this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 40);
    this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 40);
    this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 40);
    this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 40);

    // Random opacity (higher for more vibrant colors)
    this.opacity1 = 0.8 + Math.random() * 0.2; // 80-100%
    this.opacity2 = 0.8 + Math.random() * 0.2;

    // Always use multiply for authentic riso look
    this.blendMode = "multiply";

    // Update UI
    this.updateOffsetUI();

    document.getElementById("opacity1Slider").value = Math.round(
      this.opacity1 * 100
    );
    document.getElementById("opacity1Value").textContent =
      Math.round(this.opacity1 * 100) + "%";
    document.getElementById("opacity2Slider").value = Math.round(
      this.opacity2 * 100
    );
    document.getElementById("opacity2Value").textContent =
      Math.round(this.opacity2 * 100) + "%";

    document.getElementById("blendModeSelect").value = this.blendMode;

    // Update riso color selectors if they exist
    if (document.getElementById("risoColor1Select")) {
      document.getElementById("risoColor1Select").value =
        this.img1Props.risoColor;
    }
    if (document.getElementById("risoColor2Select")) {
      document.getElementById("risoColor2Select").value =
        this.img2Props.risoColor;
    }

    this.render();
    const hint = document.getElementById('startHint');
    if (hint) hint.classList.add('hidden');
  }

  clear() {
    if (
      !confirm("Clear all images and reset to default? This cannot be undone.")
    ) {
      return;
    }

    this.image1 = null;
    this.image2 = null;
    this.colors1 = [];
    this.colors2 = [];
    this.img1Props = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      hue: 0,
      offsetX: 0,
      offsetY: 0,
    };
    this.img2Props = {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      hue: 0,
      offsetX: 0,
      offsetY: 0,
    };
    this.opacity1 = 1.0;
    this.opacity2 = 1.0;
    this.blendMode = "normal";

    // Reset UI
    document.getElementById("opacity1Slider").value = 100;
    document.getElementById("opacity2Slider").value = 100;
    document.getElementById("opacity1Value").textContent = "100%";
    document.getElementById("opacity2Value").textContent = "100%";
    document.getElementById("offsetX1Slider").value = 0;
    document.getElementById("offsetX1Value").textContent = "0";
    document.getElementById("offsetY1Slider").value = 0;
    document.getElementById("offsetY1Value").textContent = "0";
    document.getElementById("offsetX2Slider").value = 0;
    document.getElementById("offsetX2Value").textContent = "0";
    document.getElementById("offsetY2Slider").value = 0;
    document.getElementById("offsetY2Value").textContent = "0";
    document.getElementById("blendModeSelect").value = "normal";

    // Reset preview slots
    const preview1 = document.getElementById("preview1");
    const preview2 = document.getElementById("preview2");
    preview1.innerHTML = '<span class="empty-slot-text">👆 Pick an image</span>';
    preview1.setAttribute("data-empty", "true");
    preview2.innerHTML = '<span class="empty-slot-text">👆 Pick an image</span>';
    preview2.setAttribute("data-empty", "true");

    this.updateColorPalette();
    this.render();
    this.updateEmptyState();
  }

  save() {
    const link = document.createElement("a");
    link.download = "riso-print.png";
    link.href = this.canvas.toDataURL();
    link.click();
  }
}

// Modal handling
let colorMixer = null;

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  const drawModeBtn = document.getElementById("drawMode");
  const drawModal = document.getElementById("drawModal");
  const closeDrawModal = document.getElementById("closeDrawModal");
  const rotationPrompt = document.getElementById("rotationPrompt");
  const dismissRotationBtn = document.getElementById("dismissRotation");

  // Check if device is mobile and in portrait mode
  function isMobilePortrait() {
    return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
  }

  if (drawModeBtn) {
    drawModeBtn.addEventListener("click", function () {
      // Check if mobile and portrait mode
      if (isMobilePortrait()) {
        // Show rotation prompt instead of modal
        rotationPrompt.classList.remove("hidden");
        rotationPrompt.classList.add("active");
        // Change button to active state
        drawModeBtn.style.backgroundColor = "#000";
        drawModeBtn.style.borderColor = "#000";
        drawModeBtn.style.color = "#fff";
      } else {
        // Desktop or landscape - show modal directly
        drawModal.style.display = "block";
        drawModeBtn.style.backgroundColor = "#000";
        drawModeBtn.style.borderColor = "#000";
        drawModeBtn.style.color = "#fff";
        if (!colorMixer) {
          colorMixer = new ColorMixer();
        }
      }
    });
  }

  // Dismiss rotation prompt and show modal anyway
  if (dismissRotationBtn) {
    dismissRotationBtn.addEventListener("click", function () {
      rotationPrompt.classList.add("hidden");
      rotationPrompt.classList.remove("active");
      drawModal.style.display = "block";
      if (!colorMixer) {
        colorMixer = new ColorMixer();
      }
    });
  }

  // Auto-hide rotation prompt if user rotates to landscape
  window.addEventListener("resize", function () {
    if (rotationPrompt.classList.contains("active") && !isMobilePortrait()) {
      rotationPrompt.classList.add("hidden");
      rotationPrompt.classList.remove("active");
      drawModal.style.display = "block";
      if (!colorMixer) {
        colorMixer = new ColorMixer();
      }
    }
  });

  // Also check on orientation change
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      if (rotationPrompt.classList.contains("active") && !isMobilePortrait()) {
        rotationPrompt.classList.add("hidden");
        rotationPrompt.classList.remove("active");
        drawModal.style.display = "block";
        if (!colorMixer) {
          colorMixer = new ColorMixer();
        }
      }
    }, 100);
  });

  if (closeDrawModal) {
    closeDrawModal.addEventListener("click", function () {
      drawModal.style.display = "none";
      // Reset button to default state (white background)
      if (drawModeBtn) {
        drawModeBtn.style.backgroundColor = "#fff";
        drawModeBtn.style.borderColor = "#e5e5e5";
        drawModeBtn.style.color = "#171717";
      }
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === drawModal) {
      drawModal.style.display = "none";
      // Reset button to default state (white background)
      if (drawModeBtn) {
        drawModeBtn.style.backgroundColor = "#fff";
        drawModeBtn.style.borderColor = "#e5e5e5";
        drawModeBtn.style.color = "#171717";
      }
    }
  });
});

// Collapsible control groups
document.addEventListener("DOMContentLoaded", function () {
  const headers = document.querySelectorAll(".control-group-header");
  const funControls = document.querySelector(".fun-controls");

  function checkAllCollapsed() {
    const allContents = document.querySelectorAll(".control-group-content");
    const allCollapsed = Array.from(allContents).every((content) =>
      content.classList.contains("collapsed")
    );

    if (funControls) {
      if (allCollapsed) {
        funControls.classList.add("all-collapsed");
      } else {
        funControls.classList.remove("all-collapsed");
      }
    }
  }

  headers.forEach((header) => {
    header.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const targetId = this.getAttribute("data-target");
      const content = document.getElementById(targetId);

      if (content) {
        // Toggle collapsed state
        this.classList.toggle("collapsed");
        content.classList.toggle("collapsed");

        // Check if all are collapsed and adjust width
        checkAllCollapsed();

        console.log(
          "Toggled:",
          targetId,
          "Is collapsed:",
          content.classList.contains("collapsed")
        );
      }
    });
  });

  // Initial check
  checkAllCollapsed();
});
