/* ============================================================
   VenueAI — Gallery, Lightbox & Discount JS  (extensions)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Image Gallery ────────────────────────────────────────
    const mainImg    = document.getElementById('gallery-main-img');
    const mainCap    = document.getElementById('gallery-caption');
    const thumbs     = document.querySelectorAll('.gallery-thumb');
    const expandBtn  = document.getElementById('gallery-expand');
    const images     = window._venueImages || [];
    let   currentIdx = 0;

    function switchImage(idx) {
        if (!mainImg || !images.length) return;
        currentIdx = (idx + images.length) % images.length;
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src         = images[currentIdx].url;
            if (mainCap) mainCap.textContent = images[currentIdx].caption;
            mainImg.style.opacity = '1';
        }, 200);

        thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIdx));
        updateLightboxDots(currentIdx);
    }

    thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => switchImage(i));
    });

    // ── Lightbox ─────────────────────────────────────────────
    const lightbox    = document.getElementById('lightbox');
    const lbImg       = document.getElementById('lightbox-img');
    const lbCap       = document.getElementById('lightbox-caption');
    const lbClose     = document.getElementById('lightbox-close');
    const lbPrev      = document.getElementById('lightbox-prev');
    const lbNext      = document.getElementById('lightbox-next');
    const lbDots      = document.querySelectorAll('.lightbox-dot');

    function openLightbox(idx) {
        if (!lightbox || !images.length) return;
        currentIdx  = (idx + images.length) % images.length;
        lbImg.src   = images[currentIdx].url;
        if (lbCap) lbCap.textContent = images[currentIdx].caption;
        lightbox.classList.add('active');
        updateLightboxDots(currentIdx);
    }

    function closeLightbox() {
        if (lightbox) lightbox.classList.remove('active');
    }

    function lbNavigate(dir) {
        if (!images.length) return;
        currentIdx = (currentIdx + dir + images.length) % images.length;
        lbImg.src  = images[currentIdx].url;
        if (lbCap) lbCap.textContent = images[currentIdx].caption;
        thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIdx));
        updateLightboxDots(currentIdx);
    }

    function updateLightboxDots(idx) {
        lbDots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    if (expandBtn) expandBtn.addEventListener('click', () => openLightbox(currentIdx));
    if (mainImg)   mainImg.addEventListener('click', () => openLightbox(currentIdx));
    if (lbClose)   lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)    lbPrev.addEventListener('click', () => lbNavigate(-1));
    if (lbNext)    lbNext.addEventListener('click', () => lbNavigate(+1));

    lbDots.forEach(dot => {
        dot.addEventListener('click', () => openLightbox(parseInt(dot.dataset.idx)));
    });

    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') lbNavigate(+1);
        if (e.key === 'ArrowLeft')  lbNavigate(-1);
        if (e.key === 'Escape')     closeLightbox();
    });

    // ── Copy promo code ──────────────────────────────────────
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.dataset.code;
            navigator.clipboard.writeText(code).then(() => {
                btn.classList.add('copied');
                btn.textContent = '✓';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.textContent = '⧉';
                }, 1800);
            }).catch(() => {
                // Fallback for older browsers
                const el = document.createElement('textarea');
                el.value = code;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                btn.textContent = '✓';
                setTimeout(() => { btn.textContent = '⧉'; }, 1800);
            });
        });
    });

    // ── Promo code click-to-copy ─────────────────────────────
    document.querySelectorAll('.promo-code').forEach(el => {
        el.addEventListener('click', () => {
            navigator.clipboard.writeText(el.textContent.trim()).catch(() => {});
            el.style.background = 'rgba(0,229,192,0.15)';
            el.style.borderColor = 'var(--success)';
            setTimeout(() => {
                el.style.background = '';
                el.style.borderColor = '';
            }, 1500);
        });
    });

});
