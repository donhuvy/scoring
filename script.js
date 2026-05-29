document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       HEADER SCROLL EFFECT
       ========================================================================== */
    const header = document.querySelector('.main-header');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       ACCESSIBLE SCROLL SPY (Highlight active nav link)
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.main-nav a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // offset header height
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       COLLAPSIBLE FAQ ACCORDION (WAI-ARIA Compliant)
       ========================================================================== */
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const contentId = trigger.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            
            // Close other items (optional, but keeps UI clean)
            faqTriggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContentId = otherTrigger.getAttribute('aria-controls');
                    document.getElementById(otherContentId).hidden = true;
                }
            });

            // Toggle current item
            trigger.setAttribute('aria-expanded', !isExpanded);
            content.hidden = isExpanded;
        });
    });

    /* ==========================================================================
       FORM VALIDATION & SUBMISSION
       ========================================================================== */
    const form = document.getElementById('contact-form');
    const honeypot = document.getElementById('honeypot');
    const toast = document.getElementById('toast');

    // Custom validation messages in Vietnamese
    const validationMessages = {
        valueMissing: 'Trường này là bắt buộc, vui lòng không bỏ trống.',
        typeMismatch: 'Định dạng email không hợp lệ (ví dụ: name@example.com).',
        tooShort: (min) => `Vui lòng nhập tối thiểu ${min} ký tự.`
    };

    const validateField = (input) => {
        const errorSpan = document.getElementById(`${input.id}-error`);
        const group = input.parentElement;
        let errorMessage = '';

        if (!input.validity.valid) {
            group.classList.add('invalid');
            if (input.validity.valueMissing) {
                errorMessage = validationMessages.valueMissing;
            } else if (input.validity.typeMismatch) {
                errorMessage = validationMessages.typeMismatch;
            } else if (input.validity.tooShort) {
                errorMessage = validationMessages.tooShort(input.getAttribute('minlength'));
            } else {
                errorMessage = input.validationMessage;
            }
            errorSpan.textContent = errorMessage;
            errorSpan.setAttribute('aria-hidden', 'false');
            return false;
        } else {
            group.classList.remove('invalid');
            errorSpan.textContent = '';
            errorSpan.setAttribute('aria-hidden', 'true');
            return true;
        }
    };

    // Attach real-time validation on blur/input
    const formInputs = form.querySelectorAll('input:not(#honeypot), textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.parentElement.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check honeypot (Anti-spam)
        if (honeypot.value !== '') {
            console.warn('Spam submission detected via honeypot.');
            return; // Discard silently
        }

        // Validate all fields
        let isFormValid = true;
        formInputs.forEach(input => {
            const isValid = validateField(input);
            if (!isValid) isFormValid = false;
        });

        if (!isFormValid) {
            // Focus on first invalid input
            const firstInvalid = form.querySelector('.form-group.invalid input, .form-group.invalid textarea');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // Simulating Form Submission success
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';

        setTimeout(() => {
            // Show toast message
            showToast('Yêu cầu hỗ trợ đã được gửi thành công!');
            
            // Reset form
            form.reset();
            formInputs.forEach(input => {
                input.parentElement.classList.remove('invalid');
                const errorSpan = document.getElementById(`${input.id}-error`);
                if (errorSpan) {
                    errorSpan.textContent = '';
                    errorSpan.setAttribute('aria-hidden', 'true');
                }
            });

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 1200);
    });

    const showToast = (message) => {
        const toastMsg = toast.querySelector('.toast-message');
        toastMsg.textContent = message;
        toast.classList.add('show');
        toast.setAttribute('aria-hidden', 'false');

        // Hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.setAttribute('aria-hidden', 'true');
        }, 4000);
    };

    /* ==========================================================================
       LIGHTBOX / SCREENSHOTS GALLERY LOGIC
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const screenshotItems = Array.from(document.querySelectorAll('.screenshot-item'));
    
    let currentImageIndex = 0;
    let lastActiveElement = null;

    const openLightbox = (index) => {
        lastActiveElement = document.activeElement;
        currentImageIndex = index;
        updateLightboxContent();
        lightbox.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
        
        // Disable body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastActiveElement) {
            lastActiveElement.focus();
        }
    };

    const updateLightboxContent = () => {
        const item = screenshotItems[currentImageIndex];
        const img = item.querySelector('img');
        
        // Dynamic loading of source
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        
        // Polish caption (strip developer/system prefixes for premium look)
        const rawAlt = img.alt || '';
        const cleanCaption = rawAlt.replace('Giao diện màn hình ứng dụng Vy score - ', '');
        lightboxCaption.textContent = cleanCaption;
    };

    const nextImage = () => {
        currentImageIndex = (currentImageIndex + 1) % screenshotItems.length;
        updateLightboxContent();
    };

    const prevImage = () => {
        currentImageIndex = (currentImageIndex - 1 + screenshotItems.length) % screenshotItems.length;
        updateLightboxContent();
    };

    // Event Listeners for Gallery Items
    screenshotItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Close & Nav Listeners
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);

    // Click backdrop to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard controls (ESC, Arrow keys, Tab trap)
    document.addEventListener('keydown', (e) => {
        const isLightboxOpen = lightbox.getAttribute('aria-hidden') === 'false';
        if (!isLightboxOpen) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight' || e.key === 'Right') {
            nextImage();
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            prevImage();
        } else if (e.key === 'Tab') {
            // Trap focus within lightbox buttons
            const focusables = [closeBtn, prevBtn, nextBtn];
            const activeElement = document.activeElement;
            
            if (e.shiftKey) {
                // Shift + Tab (go backwards)
                if (activeElement === focusables[0]) {
                    focusables[focusables.length - 1].focus();
                    e.preventDefault();
                }
            } else {
                // Tab (go forwards)
                if (activeElement === focusables[focusables.length - 1]) {
                    focusables[0].focus();
                    e.preventDefault();
                }
            }
        }
    });
});
