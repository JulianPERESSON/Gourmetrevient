/*
  =====================================================================
  SCRIPT.JS — Carrousel 3D Infini
  Basé sur le code de Clément Grellier, adapté pour le projet
  Coût de Revient Pâtisserie
  =====================================================================
*/

// ============================================================================
// CONFIGURATION
// ============================================================================

// Images locales (libres de droit, téléchargées depuis Pexels)
const PASTRY_IMAGES = {
    'mille-feuille': './img/mille-feuille.jpg',
    'paris-brest': './img/paris-brest.jpg',
    'opera': './img/opera.jpg',
    'saint-honore': './img/saint-honore.jpg',
    'fraisier': './img/fraisier.jpg',
    'tarte-tatin': './img/tarte-tatin.jpg',
    'eclair': './img/eclair.jpg',
    'baba-au-rhum': './img/baba-au-rhum.jpg',
    'macaron': './img/macaron.jpg',
    'foret-noire': './img/foret-noire.jpg'
};

// Physics constants
const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;

// Visual constants
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;

// ============================================================================
// DOM REFERENCES
// ============================================================================

const stage = document.querySelector('.stage');
const cardsRoot = document.getElementById('cards');
const bgCanvas = document.getElementById('bg');
const bgCtx = bgCanvas?.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');

// ============================================================================
// STATE
// ============================================================================

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header--landing');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Burger Menu Toggle
const burgerBtn = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');

if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

let items = [];
let positions = [];
let activeIndex = -1;
let isEntering = true;

let CARD_W = 300;
let CARD_H = 400;
let STEP = CARD_W + GAP;

let homeQualityIndex = 2; // Default to Artisanal (mapped to range value 2)
let TRACK = 0;
let SCROLL_X = 0;
let VW_HALF = window.innerWidth * 0.5;

let vX = 0;
let rafId = null;
let bgRAF = null;
let lastTime = 0;
let lastBgDraw = 0;

let gradPalette = [];
let gradCurrent = {
    r1: 240, g1: 235, b1: 228,
    r2: 235, g2: 230, b2: 220
};
let bgFastUntil = 0;

// ============================================================================
// UTILITIES
// ============================================================================

function mod(n, m) {
    return ((n % m) + m) % m;
}

// ============================================================================
// IMAGE LOADING
// ============================================================================

function preloadImageLinks(srcs) {
    if (!document.head) return;
    srcs.forEach((href) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = href;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
    });
}

function waitForImages() {
    const promises = items.map((it) => {
        const img = it.el.querySelector('img');
        if (!img || img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
        });
    });
    return Promise.all(promises);
}

async function decodeAllImages() {
    const tasks = items.map((it) => {
        const img = it.el.querySelector('img');
        if (!img) return Promise.resolve();
        if (typeof img.decode === 'function') {
            return img.decode().catch(() => { });
        }
        return Promise.resolve();
    });
    await Promise.allSettled(tasks);
}

// ============================================================================
// CARD CREATION
// ============================================================================

function createCards() {
    cardsRoot.innerHTML = '';
    items = [];

    const fragment = document.createDocumentFragment();

    const recipes = getAllRecipes();
    recipes.forEach((recipe, i) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.recipe = recipe.id;
        card.style.willChange = 'transform';

        // Image
        const imgSrc = PASTRY_IMAGES[recipe.id] || recipe.image;
        const img = new Image();
        img.className = 'card__img';
        img.decoding = 'async';
        img.loading = 'eager';
        img.fetchPriority = 'high';
        img.draggable = false;
        img.src = imgSrc;
        img.alt = recipe.name;

        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'card__overlay';

        const category = document.createElement('span');
        category.className = 'card__category';
        category.textContent = recipe.category;

        const name = document.createElement('h3');
        name.className = 'card__name';
        name.textContent = recipe.name;

        const prices = document.createElement('div');
        prices.className = 'card__prices';
        prices.setAttribute('id', `prices-${recipe.id}`);

        const q = QUALITY_LEVELS[homeQualityIndex];
        const result = computeFullCost(recipe, q); // V4.1: Compute full metrics

        prices.innerHTML = `
            <div class="price-row">
                <span class="price-label">Coût de production:</span>
                <span class="price-value">${result.coutParPortion.toFixed(2)}€</span>
            </div>
            <div class="price-row">
                <span class="price-label">Vente:</span>
                <span class="price-value">${result.prixVenteTTC.toFixed(2)}€</span>
            </div>
        `;

        overlay.appendChild(category);
        overlay.appendChild(name);
        overlay.appendChild(prices);

        card.appendChild(img);
        card.appendChild(overlay);
        fragment.appendChild(card);
        items.push({ el: card, x: i * STEP, recipe: recipe });
    });

    cardsRoot.appendChild(fragment);
}

function measure() {
    const sample = items[0]?.el;
    if (!sample) return;

    const r = sample.getBoundingClientRect();
    CARD_W = r.width || CARD_W;
    CARD_H = r.height || CARD_H;
    STEP = CARD_W + GAP;
    TRACK = items.length * STEP;

    items.forEach((it, i) => {
        it.x = i * STEP;
    });
    positions = new Float32Array(items.length);
}

// ============================================================================
// TRANSFORMS
// ============================================================================

function computeTransformComponents(screenX) {
    const norm = Math.max(-1, Math.min(1, screenX / VW_HALF));
    const absNorm = Math.abs(norm);
    const invNorm = 1 - absNorm;
    const ry = -norm * MAX_ROTATION;
    const tz = invNorm * MAX_DEPTH;
    const scale = MIN_SCALE + invNorm * SCALE_RANGE;
    return { norm, absNorm, invNorm, ry, tz, scale };
}

function transformForScreenX(screenX) {
    const { ry, tz, scale } = computeTransformComponents(screenX);
    return {
        transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
    };
}

function updateCarouselTransforms() {
    const half = TRACK / 2;
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        positions[i] = pos;
        const dist = Math.abs(pos);
        if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
        }
    }

    const prevIdx = (closestIdx - 1 + items.length) % items.length;
    const nextIdx = (closestIdx + 1) % items.length;

    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pos = positions[i];
        const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
        const { transform, z } = transformForScreenX(pos);

        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z));

        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;
    }

    if (closestIdx !== activeIndex) {
        setActiveGradient(closestIdx);
    }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function tick(t) {
    const dt = lastTime ? (t - lastTime) / 1000 : 0;
    lastTime = t;
    SCROLL_X = mod(SCROLL_X + vX * dt, TRACK);
    const decay = Math.pow(FRICTION, dt * 60);
    vX *= decay;
    if (Math.abs(vX) < 0.02) vX = 0;
    updateCarouselTransforms();
    rafId = requestAnimationFrame(tick);
}

function startCarousel() {
    cancelCarousel();
    lastTime = 0;
    rafId = requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
    });
}

function cancelCarousel() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
}

// ============================================================================
// COLOR EXTRACTION
// ============================================================================

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) { h = 0; s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    h /= 360;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function fallbackFromIndex(idx) {
    const h = (idx * 37) % 360;
    const s = 0.65;
    return { c1: hslToRgb(h, s, 0.52), c2: hslToRgb(h, s, 0.72) };
}

function extractColors(img, idx) {
    try {
        const MAX = 48;
        const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        const tw = ratio >= 1 ? MAX : Math.max(16, Math.round(MAX * ratio));
        const th = ratio >= 1 ? Math.max(16, Math.round(MAX / ratio)) : MAX;
        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, tw, th);
        const data = ctx.getImageData(0, 0, tw, th).data;

        const H_BINS = 36, S_BINS = 5, SIZE = H_BINS * S_BINS;
        const wSum = new Float32Array(SIZE);
        const rSum = new Float32Array(SIZE);
        const gSum = new Float32Array(SIZE);
        const bSum = new Float32Array(SIZE);

        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3] / 255;
            if (a < 0.05) continue;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const [h, s, l] = rgbToHsl(r, g, b);
            if (l < 0.1 || l > 0.92 || s < 0.08) continue;
            const w = a * (s * s) * (1 - Math.abs(l - 0.5) * 0.6);
            const hi = Math.max(0, Math.min(H_BINS - 1, Math.floor((h / 360) * H_BINS)));
            const si = Math.max(0, Math.min(S_BINS - 1, Math.floor(s * S_BINS)));
            const bidx = hi * S_BINS + si;
            wSum[bidx] += w;
            rSum[bidx] += r * w;
            gSum[bidx] += g * w;
            bSum[bidx] += b * w;
        }

        let pIdx = -1, pW = 0;
        for (let i = 0; i < SIZE; i++) { if (wSum[i] > pW) { pW = wSum[i]; pIdx = i; } }
        if (pIdx < 0 || pW <= 0) return fallbackFromIndex(idx);

        const pHue = Math.floor(pIdx / S_BINS) * (360 / H_BINS);
        let sIdx = -1, sW = 0;
        for (let i = 0; i < SIZE; i++) {
            const w = wSum[i];
            if (w <= 0) continue;
            const h = Math.floor(i / S_BINS) * (360 / H_BINS);
            let dh = Math.abs(h - pHue);
            dh = Math.min(dh, 360 - dh);
            if (dh >= 25 && w > sW) { sW = w; sIdx = i; }
        }

        const avgRGB = (idx) => {
            const w = wSum[idx] || 1e-6;
            return [Math.round(rSum[idx] / w), Math.round(gSum[idx] / w), Math.round(bSum[idx] / w)];
        };

        const [pr, pg, pb] = avgRGB(pIdx);
        let [h1, s1] = rgbToHsl(pr, pg, pb);
        s1 = Math.max(0.45, Math.min(1, s1 * 1.15));
        const c1 = hslToRgb(h1, s1, 0.5);

        let c2;
        if (sIdx >= 0 && sW >= pW * 0.6) {
            const [sr, sg, sb] = avgRGB(sIdx);
            let [h2, s2] = rgbToHsl(sr, sg, sb);
            s2 = Math.max(0.45, Math.min(1, s2 * 1.05));
            c2 = hslToRgb(h2, s2, 0.72);
        } else {
            c2 = hslToRgb(h1, s1, 0.72);
        }

        return { c1, c2 };
    } catch {
        return fallbackFromIndex(idx);
    }
}

function buildPalette() {
    gradPalette = items.map((it, i) => {
        const img = it.el.querySelector('img');
        return extractColors(img, i);
    });
}

function setActiveGradient(idx) {
    if (!bgCtx || idx < 0 || idx >= items.length || idx === activeIndex) return;
    activeIndex = idx;
    const pal = gradPalette[idx] || { c1: [240, 235, 228], c2: [235, 230, 220] };
    const to = {
        r1: pal.c1[0], g1: pal.c1[1], b1: pal.c1[2],
        r2: pal.c2[0], g2: pal.c2[1], b2: pal.c2[2],
    };
    if (window.gsap) {
        bgFastUntil = performance.now() + 800;
        window.gsap.to(gradCurrent, { ...to, duration: 0.45, ease: 'power2.out' });
    } else {
        Object.assign(gradCurrent, to);
    }
}

// ============================================================================
// BACKGROUND RENDERING
// ============================================================================

function resizeBG() {
    if (!bgCanvas || !bgCtx) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = bgCanvas.clientWidth || stage.clientWidth;
    const h = bgCanvas.clientHeight || stage.clientHeight;
    const tw = Math.floor(w * dpr);
    const th = Math.floor(h * dpr);
    if (bgCanvas.width !== tw || bgCanvas.height !== th) {
        bgCanvas.width = tw;
        bgCanvas.height = th;
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
}

function drawBackground() {
    if (!bgCanvas || !bgCtx) return;
    const now = performance.now();
    const minInterval = now < bgFastUntil ? 16 : 33;
    if (now - lastBgDraw < minInterval) {
        bgRAF = requestAnimationFrame(drawBackground);
        return;
    }
    lastBgDraw = now;
    resizeBG();

    const w = bgCanvas.clientWidth || stage.clientWidth;
    const h = bgCanvas.clientHeight || stage.clientHeight;

    bgCtx.fillStyle = '#f5f3ef';
    bgCtx.fillRect(0, 0, w, h);

    const time = now * 0.0002;
    const cx = w * 0.5, cy = h * 0.5;
    const a1 = Math.min(w, h) * 0.35;
    const a2 = Math.min(w, h) * 0.28;

    const x1 = cx + Math.cos(time) * a1;
    const y1 = cy + Math.sin(time * 0.8) * a1 * 0.4;
    const x2 = cx + Math.cos(-time * 0.9 + 1.2) * a2;
    const y2 = cy + Math.sin(-time * 0.7 + 0.7) * a2 * 0.5;

    const r1 = Math.max(w, h) * 0.75;
    const r2 = Math.max(w, h) * 0.65;

    const g1 = bgCtx.createRadialGradient(x1, y1, 0, x1, y1, r1);
    g1.addColorStop(0, `rgba(${gradCurrent.r1},${gradCurrent.g1},${gradCurrent.b1},0.85)`);
    g1.addColorStop(1, 'rgba(255,255,255,0)');
    bgCtx.fillStyle = g1;
    bgCtx.fillRect(0, 0, w, h);

    const g2 = bgCtx.createRadialGradient(x2, y2, 0, x2, y2, r2);
    g2.addColorStop(0, `rgba(${gradCurrent.r2},${gradCurrent.g2},${gradCurrent.b2},0.70)`);
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    bgCtx.fillStyle = g2;
    bgCtx.fillRect(0, 0, w, h);

    bgRAF = requestAnimationFrame(drawBackground);
}

function startBG() {
    if (!bgCanvas || !bgCtx) return;
    cancelBG();
    bgRAF = requestAnimationFrame(drawBackground);
}

function cancelBG() {
    if (bgRAF) cancelAnimationFrame(bgRAF);
    bgRAF = null;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onResize() {
    const prevStep = STEP || 1;
    const ratio = SCROLL_X / (items.length * prevStep);
    measure();
    VW_HALF = window.innerWidth * 0.5;
    SCROLL_X = mod(ratio * TRACK, TRACK);
    updateCarouselTransforms();
    resizeBG();
}

// Wheel
stage.addEventListener('wheel', (e) => {
    if (isEntering) return;
    if (e.target.closest('.home-quality-container')) return;

    // Only intercept horizontal wheel or if shift key is pressed
    // If vertical scroll is dominant, let the browser scroll the page
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;

    if (isHorizontal) {
        e.preventDefault();
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        vX += delta * WHEEL_SENS * 15;
    }
}, { passive: false });

stage.addEventListener('dragstart', (e) => e.preventDefault());

// Drag
let dragging = false;
let dragDirection = null; // 'h' or 'v'
let lastX = 0, lastY = 0, lastT = 0, lastDelta = 0;
let dragMoved = false;

stage.addEventListener('pointerdown', (e) => {
    if (isEntering) return;
    if (e.target.closest('.site-header') || e.target.closest('.home-quality-container')) return;

    dragging = true;
    dragDirection = null;
    dragMoved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    lastDelta = 0;

    // Do not setPointerCapture immediately to allow vertical scroll gestures
    // stage.setPointerCapture(e.pointerId); 
});

stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // Determine direction on first move
    if (!dragDirection) {
        if (Math.abs(dx) > 10) {
            dragDirection = 'h';
            stage.setPointerCapture(e.pointerId);
            stage.classList.add('dragging');
        } else if (Math.abs(dy) > 10) {
            dragDirection = 'v';
            dragging = false; // Stop carousel drag, let page scroll
            return;
        } else {
            return; // Not enough move yet
        }
    }

    if (dragDirection === 'h') {
        if (Math.abs(dx) > 3) dragMoved = true;
        const dt = Math.max(1, now - lastT) / 1000;
        SCROLL_X = mod(SCROLL_X - dx * DRAG_SENS, TRACK);
        lastDelta = dx / dt;
        lastX = e.clientX;
        lastT = now;
    }
});

stage.addEventListener('pointerup', (e) => {
    if (!dragging && dragDirection !== 'h') return;

    if (dragging && dragDirection === 'h') {
        stage.releasePointerCapture(e.pointerId);
        vX = -lastDelta * DRAG_SENS;
        stage.classList.remove('dragging');
    }

    dragging = false;
    dragDirection = null;
});

// Card click → navigate to simulator
stage.addEventListener('click', (e) => {
    if (isEntering || dragMoved) return;
    const card = e.target.closest('.card');
    if (!card) return;
    const recipeId = card.dataset.recipe;
    if (recipeId) {
        window.location.href = `simulator.html?recipe=${recipeId}&tab=technical`;
    }
});

// Resize
window.addEventListener('resize', () => {
    clearTimeout(onResize._t);
    onResize._t = setTimeout(onResize, 80);
});

// Visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelCarousel(); cancelBG(); }
    else { startCarousel(); startBG(); }
});

// ============================================================================
// ENTRY ANIMATION
// ============================================================================

async function animateEntry(visibleCards) {
    await new Promise((r) => requestAnimationFrame(r));

    const tl = window.gsap.timeline();

    visibleCards.forEach(({ item, screenX }, idx) => {
        const state = { p: 0 };
        const { ry, tz, scale: baseScale } = computeTransformComponents(screenX);
        const START_SCALE = 0.92;
        const START_Y = 40;

        item.el.style.opacity = '0';
        item.el.style.transform =
            `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${START_SCALE}) translateY(${START_Y}px)`;

        tl.to(state, {
            p: 1,
            duration: 0.6,
            ease: 'power3.out',
            onUpdate: () => {
                const t = state.p;
                const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
                const currentY = START_Y * (1 - t);
                item.el.style.opacity = t.toFixed(3);
                if (t >= 0.999) {
                    const { transform } = transformForScreenX(screenX);
                    item.el.style.transform = transform;
                } else {
                    item.el.style.transform =
                        `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${currentScale}) translateY(${currentY}px)`;
                }
            },
        }, idx * 0.05);
    });

    await new Promise((resolve) => {
        tl.eventCallback('onComplete', resolve);
    });
}

async function warmupCompositing() {
    const originalScrollX = SCROLL_X;
    const stepSize = STEP * 0.5;
    const numSteps = Math.ceil(TRACK / stepSize);
    for (let i = 0; i < numSteps; i++) {
        SCROLL_X = mod(originalScrollX + i * stepSize, TRACK);
        updateCarouselTransforms();
        if (i % 3 === 0) await new Promise((r) => requestAnimationFrame(r));
    }
    SCROLL_X = originalScrollX;
    updateCarouselTransforms();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
    const imageSrcs = RECIPES.map(r => PASTRY_IMAGES[r.id] || r.image);
    preloadImageLinks(imageSrcs);

    createCards();
    measure();
    updateCarouselTransforms();
    stage.classList.add('carousel-mode');

    await waitForImages();
    await decodeAllImages();

    items.forEach((it) => {
        const img = it.el.querySelector('img');
        if (img) void img.offsetHeight;
    });

    buildPalette();

    const half = TRACK / 2;
    let closestIdx = 0, closestDist = Infinity;
    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        if (Math.abs(pos) < closestDist) { closestDist = Math.abs(pos); closestIdx = i; }
    }
    setActiveGradient(closestIdx);

    resizeBG();
    if (bgCtx) {
        const w = bgCanvas.clientWidth || stage.clientWidth;
        const h = bgCanvas.clientHeight || stage.clientHeight;
        bgCtx.fillStyle = '#f5f3ef';
        bgCtx.fillRect(0, 0, w, h);
    }

    await warmupCompositing();

    if ('requestIdleCallback' in window) {
        await new Promise((r) => requestIdleCallback(r, { timeout: 100 }));
    }

    startBG();
    await new Promise((r) => setTimeout(r, 100));

    const viewportWidth = window.innerWidth;
    const visibleCards = [];
    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        if (Math.abs(pos) < viewportWidth * 0.6) {
            visibleCards.push({ item: items[i], screenX: pos, index: i });
        }
    }
    visibleCards.sort((a, b) => a.screenX - b.screenX);

    if (loader) loader.classList.add('loader--hide');

    // Final measure once things are visible to ensure correct transforms
    setTimeout(measure, 50);

    await animateEntry(visibleCards);
    isEntering = false;
    startCarousel();
}

// Start!
init();

// ============================================================================
// V4: HOME QUALITY SLIDER LOGIC
// ============================================================================

const homeSlider = document.getElementById('homeQualityRange');
if (homeSlider) {
    homeSlider.addEventListener('input', (e) => {
        homeQualityIndex = parseInt(e.target.value);
        updateAllCardPrices();
        updateHomeSliderLabels();
    });
}

function updateAllCardPrices() {
    const q = QUALITY_LEVELS[homeQualityIndex];

    items.forEach(item => {
        const pricesEl = item.el.querySelector('.card__prices');
        if (pricesEl && item.recipe) {
            const result = computeFullCost(item.recipe, q);
            pricesEl.innerHTML = `
                <div class="price-row">
                    <span class="price-label">Coût de production:</span>
                    <span class="price-value">${result.coutParPortion.toFixed(2)}€</span>
                </div>
                <div class="price-row">
                    <span class="price-label">Vente:</span>
                    <span class="price-value">${result.prixVenteTTC.toFixed(2)}€</span>
                </div>
            `;
        }
    });
}

function updateHomeSliderLabels() {
    const labels = document.querySelectorAll('.quality-mini-labels span');
    labels.forEach((label, i) => {
        label.classList.toggle('active', i === homeQualityIndex);
    });
}

// Ensure labels are synced on load
document.addEventListener('DOMContentLoaded', () => {
    if (homeSlider) {
        updateHomeSliderLabels();
    }
});
