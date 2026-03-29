/* ============================================================
   VenueAI — Immersive 3D Client-Side JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Auto-dismiss flash messages ───────────────────
    document.querySelectorAll('.flash').forEach((flash, i) => {
        setTimeout(() => {
            flash.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            flash.style.opacity = '0';
            flash.style.transform = 'translateX(-30px) rotateY(-10deg)';
            setTimeout(() => flash.remove(), 500);
        }, 4000 + i * 500);
    });

    // ── 3D Tilt Effect on Cards ──────────────────────
    const tiltElements = document.querySelectorAll('.tilt-3d');
    const tiltConfig = { max: 8, speed: 400, perspective: 1200 };

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -tiltConfig.max;
            const rotateY = ((x - centerX) / centerX) * tiltConfig.max;

            el.style.transition = 'transform 0.1s ease-out';
            el.style.transform = `perspective(${tiltConfig.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = `transform ${tiltConfig.speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
            el.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
        });
    });

    // ── Parallax Background Orbs on Mouse Move ───────
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateParallax() {
        currentX += (mouseX - currentX) * 0.05;
        currentY += (mouseY - currentY) * 0.05;

        document.body.style.setProperty('--parallax-x', `${currentX * 15}px`);
        document.body.style.setProperty('--parallax-y', `${currentY * 15}px`);

        // Move background orbs
        const before = document.body;
        if (before) {
            before.style.backgroundPosition = `${50 + currentX * 3}% ${50 + currentY * 3}%`;
        }

        requestAnimationFrame(animateParallax);
    }
    animateParallax();

    // ── Floating Particles ───────────────────────────
    function createParticles() {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (8 + Math.random() * 12) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.width = (2 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;

            // Randomize color between accent and success
            const colors = [
                'rgba(124, 108, 240, 0.6)',
                'rgba(0, 229, 192, 0.5)',
                'rgba(180, 168, 255, 0.4)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 6px ${particle.style.background}`;

            document.body.appendChild(particle);
        }
    }
    createParticles();

    // ── Scroll-Triggered 3D Reveal ───────────────────
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateZ(0) rotateX(0) translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe glass cards that aren't already animated by CSS
    document.querySelectorAll('.glass-card:not(.venue-card):not(.search-bar)').forEach(card => {
        if (!card.closest('.modal-overlay')) {
            card.style.opacity = '0';
            card.style.transform = 'translateZ(-30px) rotateX(5deg) translateY(20px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            revealObserver.observe(card);
        }
    });

    // ── Modal helpers (event-delegated) ──────────────
    window.openModal = function (id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            overlay.classList.add('active');
            // Re-trigger animation
            const modal = overlay.querySelector('.modal');
            if (modal) {
                modal.style.animation = 'none';
                modal.offsetHeight; // force reflow
                modal.style.animation = '';
            }
        }
    };

    window.closeModal = function (id) {
        const overlay = document.getElementById(id);
        if (overlay) {
            const modal = overlay.querySelector('.modal');
            if (modal) {
                modal.style.transition = 'all 0.3s ease';
                modal.style.opacity = '0';
                modal.style.transform = 'translateZ(-100px) rotateX(10deg) scale(0.95)';
                setTimeout(() => {
                    overlay.classList.remove('active');
                    modal.style.opacity = '';
                    modal.style.transform = '';
                    modal.style.transition = '';
                }, 300);
            } else {
                overlay.classList.remove('active');
            }
        }
    };

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
                closeModal(overlay.id);
            });
        }
    });

    // ── Event-delegated button handlers ──────────────

    // Open modal via data-modal attribute
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.dataset.modal);
        });
    });

    // Close modal via data-close-modal attribute
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.closeModal);
        });
    });

    // Edit venue via data-edit-venue attribute
    document.querySelectorAll('[data-edit-venue]').forEach(btn => {
        btn.addEventListener('click', () => {
            const venueId = btn.dataset.editVenue;
            const row = document.querySelector(`[data-venue-id="${venueId}"]`);
            if (!row) return;
            document.getElementById('edit-venue-id').value = venueId;
            document.getElementById('edit-name').value = row.dataset.name;
            document.getElementById('edit-location').value = row.dataset.location;
            document.getElementById('edit-capacity').value = row.dataset.capacity;
            document.getElementById('edit-price').value = row.dataset.price;
            document.getElementById('edit-amenities').value = row.dataset.amenities;
            document.getElementById('edit-image').value = row.dataset.image || '';
            document.getElementById('edit-form').action = `/admin/venues/${venueId}/edit`;
            openModal('editModal');
        });
    });

    // Cancel booking via data-cancel-id attribute
    document.querySelectorAll('[data-cancel-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const bookingId = btn.dataset.cancelId;
            if (confirm('Are you sure you want to cancel this booking?')) {
                document.getElementById(`cancel-form-${bookingId}`).submit();
            }
        });
    });

    // ── Active nav link highlight ────────────────────
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.getAttribute('href') === path) {
            a.classList.add('active');
        }
    });

    // ── Smooth input focus glow ──────────────────────
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', () => {
            const parent = input.closest('.glass-card, .auth-card, .modal');
            if (parent) {
                parent.style.borderColor = 'rgba(124, 108, 240, 0.2)';
            }
        });
        input.addEventListener('blur', () => {
            const parent = input.closest('.glass-card, .auth-card, .modal');
            if (parent) {
                parent.style.borderColor = '';
            }
        });
    });

    // ── Button ripple effect ─────────────────────────
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out forwards;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Inject ripple keyframes
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes rippleEffect {
            to { transform: scale(2.5); opacity: 0; }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ── Navbar scroll depth effect ───────────────────
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const depth = Math.min(scrollY / 5, 15);

            navbar.style.boxShadow = `0 ${4 + depth}px ${30 + depth * 2}px rgba(0,0,0,${0.3 + scrollY * 0.001}), 0 0 ${60 + depth * 3}px rgba(124,108,240,${0.05 + scrollY * 0.0003})`;

            if (scrollY > 50) {
                navbar.style.borderBottomColor = 'rgba(124, 108, 240, 0.15)';
            } else {
                navbar.style.borderBottomColor = 'rgba(124, 108, 240, 0.1)';
            }

            lastScroll = scrollY;
        });
    }

    // ── Stagger-animate table rows ───────────────────
    document.querySelectorAll('tbody tr').forEach((row, i) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px) translateZ(-10px)';
        row.style.transition = `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s`;

        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0) translateZ(0)';
        }, 100);
    });
});
