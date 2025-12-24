// Image Gallery Script
console.log('Image gallery loaded successfully!');

// Toggle between scroll and grid view (Grid is default now)
const toggleButton = document.getElementById('toggleView');
const galleryContainer = document.getElementById('galleryContainer');

let isScrollView = false;

toggleButton.addEventListener('click', function() {
    isScrollView = !isScrollView;

    if (isScrollView) {
        galleryContainer.classList.add('scroll-view');
        toggleButton.textContent = 'Switch to Grid View';
    } else {
        galleryContainer.classList.remove('scroll-view');
        toggleButton.textContent = 'Switch to Scroll View';
    }
});

// ============================================
// RISOGRAPH PRINT SIMULATOR
// ============================================

// Authentic Risograph ink colors (CMYK-like primaries + special colors)
const RISO_COLORS = {
    'fluorescent-pink': { r: 255, g: 72, b: 176, name: 'Fluorescent Pink' },
    'fluorescent-orange': { r: 255, g: 102, b: 0, name: 'Fluorescent Orange' },
    'sunflower': { r: 255, g: 180, b: 0, name: 'Sunflower' },
    'yellow': { r: 255, g: 232, b: 0, name: 'Yellow' },
    'light-lime': { r: 228, g: 255, b: 43, name: 'Light Lime' },
    'green': { r: 0, g: 166, b: 81, name: 'Green' },
    'teal': { r: 0, g: 169, b: 157, name: 'Teal' },
    'aqua': { r: 0, g: 169, b: 224, name: 'Aqua' },
    'sky-blue': { r: 73, g: 180, b: 230, name: 'Sky Blue' },
    'blue': { r: 0, g: 120, b: 191, name: 'Blue' },
    'violet': { r: 101, g: 50, b: 149, name: 'Violet' },
    'purple': { r: 114, g: 65, b: 144, name: 'Purple' },
    'burgundy': { r: 145, g: 57, b: 89, name: 'Burgundy' },
    'red': { r: 255, g: 72, b: 0, name: 'Red' },
    'scarlet': { r: 240, g: 76, b: 60, name: 'Scarlet' },
    'bright-red': { r: 255, g: 53, b: 71, name: 'Bright Red' },
    'black': { r: 0, g: 0, b: 0, name: 'Black' },
};

class ColorMixer {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Images with transform properties
        this.image1 = null;
        this.image2 = null;
        this.opacity1 = 1.0;
        this.opacity2 = 1.0;

        // Transform properties for each image
        this.img1Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0, risoColor: null };
        this.img2Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0, risoColor: null };

        // Risograph effects
        this.grainIntensity = 0.15;
        this.halftoneEnabled = true;
        this.paperTexture = true;
        this.separationMode = false;

        // Blend mode
        this.blendMode = 'multiply'; // Default to multiply for authentic riso look

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

        this.init();
    }

    init() {
        document.getElementById('selectImage1').addEventListener('click', () => this.showPicker(1));
        document.getElementById('selectImage2').addEventListener('click', () => this.showPicker(2));

        // Make preview slots clickable too
        document.getElementById('preview1').addEventListener('click', () => this.showPicker(1));
        document.getElementById('preview2').addEventListener('click', () => this.showPicker(2));

        // Opacity sliders
        document.getElementById('opacity1Slider').addEventListener('input', (e) => {
            this.opacity1 = e.target.value / 100;
            document.getElementById('opacity1Value').textContent = e.target.value + '%';
            this.render();
        });

        document.getElementById('opacity2Slider').addEventListener('input', (e) => {
            this.opacity2 = e.target.value / 100;
            document.getElementById('opacity2Value').textContent = e.target.value + '%';
            this.render();
        });

        // File upload handlers
        document.getElementById('uploadImage1Btn').addEventListener('click', () => {
            document.getElementById('uploadImage1').click();
        });
        document.getElementById('uploadImage2Btn').addEventListener('click', () => {
            document.getElementById('uploadImage2').click();
        });

        document.getElementById('uploadImage1').addEventListener('change', (e) => {
            this.handleFileUpload(e, 1);
        });
        document.getElementById('uploadImage2').addEventListener('change', (e) => {
            this.handleFileUpload(e, 2);
        });

        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('saveBtn').addEventListener('click', () => this.save());

        // Picker
        document.getElementById('closeImagePicker').addEventListener('click', () => this.hidePicker());
        document.getElementById('imagePickerOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'imagePickerOverlay') this.hidePicker();
        });

        // Canvas mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());

        // Keyboard events for rotation
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Mobile rotation buttons
        document.getElementById('rotateImg1Left').addEventListener('click', () => this.rotateImage(1, -1));
        document.getElementById('rotateImg1Right').addEventListener('click', () => this.rotateImage(1, 1));
        document.getElementById('rotateImg2Left').addEventListener('click', () => this.rotateImage(2, -1));
        document.getElementById('rotateImg2Right').addEventListener('click', () => this.rotateImage(2, 1));

        // Fun Effects buttons
        document.getElementById('randomDotsBtn').addEventListener('click', () => this.drawRandomDots());
        document.getElementById('randomLinesBtn').addEventListener('click', () => this.drawRandomLines());
        document.getElementById('mixColorsBtn').addEventListener('click', () => this.drawColorMix());

        // Riso color selectors
        document.getElementById('risoColor1Select').addEventListener('change', (e) => {
            this.img1Props.risoColor = e.target.value || null;
            this.render();
        });
        document.getElementById('risoColor2Select').addEventListener('change', (e) => {
            this.img2Props.risoColor = e.target.value || null;
            this.render();
        });

        // Offset sliders for Image 1
        document.getElementById('offsetX1Slider').addEventListener('input', (e) => {
            this.img1Props.offsetX = parseInt(e.target.value);
            document.getElementById('offsetX1Value').textContent = e.target.value;
            this.render();
        });
        document.getElementById('offsetY1Slider').addEventListener('input', (e) => {
            this.img1Props.offsetY = parseInt(e.target.value);
            document.getElementById('offsetY1Value').textContent = e.target.value;
            this.render();
        });

        // Offset sliders for Image 2
        document.getElementById('offsetX2Slider').addEventListener('input', (e) => {
            this.img2Props.offsetX = parseInt(e.target.value);
            document.getElementById('offsetX2Value').textContent = e.target.value;
            this.render();
        });
        document.getElementById('offsetY2Slider').addEventListener('input', (e) => {
            this.img2Props.offsetY = parseInt(e.target.value);
            document.getElementById('offsetY2Value').textContent = e.target.value;
            this.render();
        });

        // Blend mode selector
        document.getElementById('blendModeSelect').addEventListener('change', (e) => {
            this.blendMode = e.target.value;
            this.render();
        });

        // Surprise Me button
        document.getElementById('surpriseMeBtn').addEventListener('click', () => this.surpriseMe());

        // Separation mode toggle
        document.getElementById('separationModeBtn').addEventListener('click', () => this.toggleSeparationMode());

        // Misregistration preset buttons
        document.querySelectorAll('.misreg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.getAttribute('data-preset');
                this.applyMisregistrationPreset(preset);
            });
        });

        // Touch events for mobile dragging
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.onTouchEnd());

        this.render();
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
        const grid = document.getElementById('imagePickerGrid');
        grid.innerHTML = '';

        // Use data-src pattern for lazy loading in picker
        document.querySelectorAll('#galleryContainer img').forEach((img, index) => {
            const thumb = document.createElement('img');
            // Load first 12 images immediately, rest lazily
            if (index < 12) {
                thumb.src = img.src;
            } else {
                thumb.dataset.src = img.src;
                thumb.loading = 'lazy';
            }
            thumb.decoding = 'async';
            thumb.addEventListener('click', () => {
                this.loadImage(img.src, slot);
                this.hidePicker();
            });
            grid.appendChild(thumb);
        });

        // Lazy load remaining images
        this.lazyLoadPickerImages();

        document.getElementById('imagePickerOverlay').classList.remove('hidden');
    }

    lazyLoadPickerImages() {
        const lazyImages = document.querySelectorAll('#imagePickerGrid img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    hidePicker() {
        document.getElementById('imagePickerOverlay').classList.add('hidden');
    }

    loadImage(src, slot) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.loading = 'eager';

        // Optimize image loading with decode()
        img.onload = async () => {
            try {
                // Decode the image before using it for faster rendering
                await img.decode();
            } catch (e) {
                console.log('Image decode not supported, using standard loading');
            }

            if (slot === 1) {
                this.image1 = img;
                this.colors1 = this.extractColors(img);
                this.img1Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0 };
                this.updatePreviewSlot(1, src);
            } else {
                this.image2 = img;
                this.colors2 = this.extractColors(img);
                this.img2Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0 };
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
        previewSlot.setAttribute('data-empty', 'false');
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyCanvasState');
        if (this.image1 || this.image2) {
            emptyState.classList.add('hidden');
        } else {
            emptyState.classList.remove('hidden');
        }
    }

    handleFileUpload(event, slot) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
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

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width * scale;
        tempCanvas.height = img.height * scale;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

        const colors = [];
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
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
        const palette1 = document.getElementById('palette1');
        const palette2 = document.getElementById('palette2');

        palette1.innerHTML = '';
        palette2.innerHTML = '';

        // Remove collapsed class to show palettes
        palette1.classList.remove('collapsed');
        palette2.classList.remove('collapsed');

        this.colors1.slice(0, 10).forEach(c => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.background = `rgb(${c.r},${c.g},${c.b})`;
            palette1.appendChild(swatch);
        });

        this.colors2.slice(0, 10).forEach(c => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.background = `rgb(${c.r},${c.g},${c.b})`;
            palette2.appendChild(swatch);
        });

        // Auto-collapse palettes after 5 seconds
        clearTimeout(this.paletteTimeout1);
        clearTimeout(this.paletteTimeout2);

        this.paletteTimeout1 = setTimeout(() => {
            palette1.classList.add('collapsed');
        }, 5000);

        this.paletteTimeout2 = setTimeout(() => {
            palette2.classList.add('collapsed');
        }, 5000);
    }

    createHalftonePattern() {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 4;
        patternCanvas.height = 4;
        const pCtx = patternCanvas.getContext('2d');

        pCtx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (Math.random() > 0.5) {
                    pCtx.fillRect(i, j, 1, 1);
                }
            }
        }

        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    applyRisoColorTint(imageData, risoColor) {
        if (!risoColor) return imageData;

        const data = imageData.data;
        const color = RISO_COLORS[risoColor];

        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const brightness = gray / 255;

            data[i] = color.r * brightness;
            data[i + 1] = color.g * brightness;
            data[i + 2] = color.b * brightness;
        }

        return imageData;
    }

    toggleSeparationMode() {
        this.separationMode = !this.separationMode;
        const btn = document.getElementById('separationModeBtn');
        if (btn) {
            btn.textContent = this.separationMode ? 'Combined View' : 'Separation View';
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
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const halfWidth = this.canvas.width / 2;

        // Draw layer 1 on left half
        if (this.image1) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(0, 0, halfWidth, this.canvas.height);
            this.ctx.clip();

            // Paper texture
            if (this.paperTexture && this.halftonePattern) {
                this.ctx.fillStyle = '#f8f5f0';
                this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
                this.ctx.globalAlpha = 0.03;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
                this.ctx.globalAlpha = 1;
            }

            this.ctx.globalAlpha = this.opacity1;
            this.ctx.globalCompositeOperation = 'source-over';

            // Scale down to fit in half
            const tempProps = {...this.img1Props};
            tempProps.x = tempProps.x - this.canvas.width / 4;
            tempProps.scale = tempProps.scale * 0.5;
            this.drawImageWithTransform(this.image1, tempProps);

            // Add grain
            if (this.grainIntensity > 0 && this.halftonePattern) {
                this.ctx.globalAlpha = this.grainIntensity * this.opacity1;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(0, 0, halfWidth, this.canvas.height);
            }

            this.ctx.restore();

            // Label
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.fillText('Layer 1', 10, 30);
            if (this.img1Props.risoColor) {
                this.ctx.fillText(RISO_COLORS[this.img1Props.risoColor].name, 10, 50);
            }
        }

        // Draw divider line
        this.ctx.strokeStyle = '#ccc';
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

            // Paper texture
            if (this.paperTexture && this.halftonePattern) {
                this.ctx.fillStyle = '#f8f5f0';
                this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
                this.ctx.globalAlpha = 0.03;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
                this.ctx.globalAlpha = 1;
            }

            this.ctx.globalAlpha = this.opacity2;
            this.ctx.globalCompositeOperation = 'source-over';

            // Scale down to fit in half
            const tempProps = {...this.img2Props};
            tempProps.x = tempProps.x + this.canvas.width / 4;
            tempProps.scale = tempProps.scale * 0.5;
            this.drawImageWithTransform(this.image2, tempProps);

            // Add grain
            if (this.grainIntensity > 0 && this.halftonePattern) {
                this.ctx.globalAlpha = this.grainIntensity * this.opacity2;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(halfWidth, 0, halfWidth, this.canvas.height);
            }

            this.ctx.restore();

            // Label
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 16px sans-serif';
            this.ctx.fillText('Layer 2', halfWidth + 10, 30);
            if (this.img2Props.risoColor) {
                this.ctx.fillText(RISO_COLORS[this.img2Props.risoColor].name, halfWidth + 10, 50);
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderCombined() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Paper texture background
        if (this.paperTexture) {
            this.ctx.fillStyle = '#f8f5f0';
        } else {
            this.ctx.fillStyle = '#fff';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle paper texture
        if (this.paperTexture && this.halftonePattern) {
            this.ctx.globalAlpha = 0.03;
            this.ctx.fillStyle = this.halftonePattern;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
        }

        if (this.image1) {
            this.ctx.globalAlpha = this.opacity1;
            this.ctx.globalCompositeOperation = 'source-over';
            this.drawImageWithTransform(this.image1, this.img1Props);

            // Add grain texture overlay
            if (this.grainIntensity > 0 && this.halftonePattern) {
                this.ctx.globalAlpha = this.grainIntensity * this.opacity1;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        if (this.image2) {
            this.ctx.globalAlpha = this.opacity2;
            this.ctx.globalCompositeOperation = this.blendMode;
            this.drawImageWithTransform(this.image2, this.img2Props);

            // Add grain texture overlay
            if (this.grainIntensity > 0 && this.halftonePattern) {
                this.ctx.globalAlpha = this.grainIntensity * this.opacity2;
                this.ctx.fillStyle = this.halftonePattern;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawImageWithTransform(img, props) {
        this.ctx.save();

        // Calculate initial centered position if not set
        const scale = Math.min(this.canvas.width / img.width, this.canvas.height / img.height) * 0.8;
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
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw image to temp canvas
            tempCtx.drawImage(img, 0, 0, w, h);

            // Get image data and apply riso color tint
            const imageData = tempCtx.getImageData(0, 0, w, h);
            this.applyRisoColorTint(imageData, props.risoColor);
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
            this.ctx.filter = 'none';
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
            this.canvas.style.cursor = 'grabbing';
        } else if (this.image1 && this.isPointInImage(x, y, this.image1, this.img1Props)) {
            this.isDragging = true;
            this.dragImage = 1;
            this.dragStartX = x - this.img1Props.x;
            this.dragStartY = y - this.img1Props.y;
            this.canvas.style.cursor = 'grabbing';
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
            if ((this.image2 && this.isPointInImage(x, y, this.image2, this.img2Props)) ||
                (this.image1 && this.isPointInImage(x, y, this.image1, this.img1Props))) {
                this.canvas.style.cursor = 'grab';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.dragImage = null;
        this.canvas.style.cursor = 'default';
    }

    isPointInImage(x, y, img, props) {
        const scale = Math.min(this.canvas.width / img.width, this.canvas.height / img.height) * 0.8;
        const w = img.width * scale * props.scale;
        const h = img.height * scale * props.scale;
        const centerX = this.canvas.width / 2 + props.x;
        const centerY = this.canvas.height / 2 + props.y;

        // Simple bounding box check (not accounting for rotation for simplicity)
        return x >= centerX - w / 2 && x <= centerX + w / 2 &&
               y >= centerY - h / 2 && y <= centerY + h / 2;
    }

    // Keyboard handler for rotation
    onKeyDown(e) {
        if (!this.image1 && !this.image2) return;

        const rotationStep = Math.PI / 36; // 5 degrees

        if (e.key === 'q' || e.key === 'Q') {
            // Rotate image 1 counter-clockwise
            if (this.image1) {
                this.img1Props.rotation -= rotationStep;
                this.render();
            }
        } else if (e.key === 'e' || e.key === 'E') {
            // Rotate image 1 clockwise
            if (this.image1) {
                this.img1Props.rotation += rotationStep;
                this.render();
            }
        } else if (e.key === 'a' || e.key === 'A') {
            // Rotate image 2 counter-clockwise
            if (this.image2) {
                this.img2Props.rotation -= rotationStep;
                this.render();
            }
        } else if (e.key === 'd' || e.key === 'D') {
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
        } else if (this.image1 && this.isPointInImage(x, y, this.image1, this.img1Props)) {
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
            alert('Please select images first to extract colors!');
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
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
            alert('Please select images first to extract colors!');
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < 100; i++) {
            const c = allColors[Math.floor(Math.random() * allColors.length)];

            this.ctx.strokeStyle = `rgb(${c.r},${c.g},${c.b})`;
            this.ctx.lineWidth = Math.random() * 8 + 2;
            this.ctx.globalAlpha = Math.random() * 0.6 + 0.4;

            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
    }

    drawColorMix() {
        const allColors = [...this.colors1, ...this.colors2];
        if (allColors.length === 0) {
            alert('Please select images first to extract colors!');
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
            alert('Please load both images first!');
            return;
        }

        switch(preset) {
            case 'subtle':
                this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 10);
                this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 10);
                this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 10);
                this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 10);
                break;
            case 'moderate':
                this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 30);
                this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 30);
                this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 30);
                this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 30);
                break;
            case 'extreme':
                this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 80);
                this.img1Props.offsetY = Math.floor((Math.random() - 0.5) * 80);
                this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 80);
                this.img2Props.offsetY = Math.floor((Math.random() - 0.5) * 80);
                break;
            case 'horizontal':
                this.img1Props.offsetX = Math.floor((Math.random() - 0.5) * 50);
                this.img1Props.offsetY = 0;
                this.img2Props.offsetX = Math.floor((Math.random() - 0.5) * 50);
                this.img2Props.offsetY = 0;
                break;
            case 'vertical':
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
        document.getElementById('offsetX1Slider').value = this.img1Props.offsetX;
        document.getElementById('offsetX1Value').textContent = this.img1Props.offsetX;
        document.getElementById('offsetY1Slider').value = this.img1Props.offsetY;
        document.getElementById('offsetY1Value').textContent = this.img1Props.offsetY;
        document.getElementById('offsetX2Slider').value = this.img2Props.offsetX;
        document.getElementById('offsetX2Value').textContent = this.img2Props.offsetX;
        document.getElementById('offsetY2Slider').value = this.img2Props.offsetY;
        document.getElementById('offsetY2Value').textContent = this.img2Props.offsetY;
    }

    surpriseMe() {
        if (!this.image1 || !this.image2) {
            alert('Please load both images first!');
            return;
        }

        // Pick random authentic riso colors for each layer
        const risoColorKeys = Object.keys(RISO_COLORS);
        this.img1Props.risoColor = risoColorKeys[Math.floor(Math.random() * risoColorKeys.length)];
        this.img2Props.risoColor = risoColorKeys[Math.floor(Math.random() * risoColorKeys.length)];

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
        this.blendMode = 'multiply';

        // Update UI
        this.updateOffsetUI();

        document.getElementById('opacity1Slider').value = Math.round(this.opacity1 * 100);
        document.getElementById('opacity1Value').textContent = Math.round(this.opacity1 * 100) + '%';
        document.getElementById('opacity2Slider').value = Math.round(this.opacity2 * 100);
        document.getElementById('opacity2Value').textContent = Math.round(this.opacity2 * 100) + '%';

        document.getElementById('blendModeSelect').value = this.blendMode;

        // Update riso color selectors if they exist
        if (document.getElementById('risoColor1Select')) {
            document.getElementById('risoColor1Select').value = this.img1Props.risoColor;
        }
        if (document.getElementById('risoColor2Select')) {
            document.getElementById('risoColor2Select').value = this.img2Props.risoColor;
        }

        this.render();
    }

    clear() {
        if (!confirm('Clear all images and reset to default? This cannot be undone.')) {
            return;
        }

        this.image1 = null;
        this.image2 = null;
        this.colors1 = [];
        this.colors2 = [];
        this.img1Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0 };
        this.img2Props = { x: 0, y: 0, rotation: 0, scale: 1, hue: 0, offsetX: 0, offsetY: 0 };
        this.opacity1 = 1.0;
        this.opacity2 = 1.0;
        this.blendMode = 'normal';

        // Reset UI
        document.getElementById('opacity1Slider').value = 100;
        document.getElementById('opacity2Slider').value = 100;
        document.getElementById('opacity1Value').textContent = '100%';
        document.getElementById('opacity2Value').textContent = '100%';
        document.getElementById('offsetX1Slider').value = 0;
        document.getElementById('offsetX1Value').textContent = '0';
        document.getElementById('offsetY1Slider').value = 0;
        document.getElementById('offsetY1Value').textContent = '0';
        document.getElementById('offsetX2Slider').value = 0;
        document.getElementById('offsetX2Value').textContent = '0';
        document.getElementById('offsetY2Slider').value = 0;
        document.getElementById('offsetY2Value').textContent = '0';
        document.getElementById('blendModeSelect').value = 'normal';

        // Reset preview slots
        const preview1 = document.getElementById('preview1');
        const preview2 = document.getElementById('preview2');
        preview1.innerHTML = '<span class="empty-slot-text">🖼️ Click to select Image 1</span>';
        preview1.setAttribute('data-empty', 'true');
        preview2.innerHTML = '<span class="empty-slot-text">🖼️ Click to select Image 2</span>';
        preview2.setAttribute('data-empty', 'true');

        this.updateColorPalette();
        this.render();
        this.updateEmptyState();
    }

    save() {
        const link = document.createElement('a');
        link.download = 'color-mix.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Modal handling
let colorMixer = null;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const drawModeBtn = document.getElementById('drawMode');
    const drawModal = document.getElementById('drawModal');
    const closeDrawModal = document.getElementById('closeDrawModal');

    if (drawModeBtn) {
        drawModeBtn.addEventListener('click', function() {
            drawModal.style.display = 'block';
            if (!colorMixer) {
                colorMixer = new ColorMixer();
            }
        });
    }

    if (closeDrawModal) {
        closeDrawModal.addEventListener('click', function() {
            drawModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === drawModal) {
            drawModal.style.display = 'none';
        }
    });
});

// Collapsible control groups
document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.control-group-header');
    const funControls = document.querySelector('.fun-controls');

    function checkAllCollapsed() {
        const allContents = document.querySelectorAll('.control-group-content');
        const allCollapsed = Array.from(allContents).every(content => content.classList.contains('collapsed'));

        if (funControls) {
            if (allCollapsed) {
                funControls.classList.add('all-collapsed');
            } else {
                funControls.classList.remove('all-collapsed');
            }
        }
    }

    headers.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);

            if (content) {
                // Toggle collapsed state
                this.classList.toggle('collapsed');
                content.classList.toggle('collapsed');

                // Check if all are collapsed and adjust width
                checkAllCollapsed();

                console.log('Toggled:', targetId, 'Is collapsed:', content.classList.contains('collapsed'));
            }
        });
    });

    // Initial check
    checkAllCollapsed();
});
