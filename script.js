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
       LANGUAGE SWITCHER & TRANSLATION SYSTEM
       ========================================================================== */
    // Safe LocalStorage wrapper to avoid SecurityError in restricted/incognito frames or local previews
    const safeLocalStorage = {
        getItem(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return null;
            }
        },
        setItem(key, value) {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    const langBtn = document.querySelector('.lang-btn');
    const langDropdown = document.querySelector('.lang-dropdown');
    const langSelectorContainer = document.querySelector('.lang-selector-container');
    const langOptions = langDropdown.querySelectorAll('li');

    // Toggle dropdown
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langDropdown.classList.contains('show');
        langDropdown.classList.toggle('show', !isOpen);
        langBtn.setAttribute('aria-expanded', !isOpen);
    });

    // Keyboard controls for the toggle button
    langBtn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const isOpen = langDropdown.classList.contains('show');
            if (!isOpen) {
                langDropdown.classList.add('show');
                langBtn.setAttribute('aria-expanded', 'true');
            }
            const activeOpt = langDropdown.querySelector('li.active') || langOptions[0];
            if (activeOpt) {
                activeOpt.focus();
            }
        }
    });

    // Close on click or touch outside (touchstart makes it robust on mobile iOS Safari)
    const closeDropdownOutside = (e) => {
        if (!langSelectorContainer.contains(e.target)) {
            langDropdown.classList.remove('show');
            langBtn.setAttribute('aria-expanded', 'false');
        }
    };
    document.addEventListener('click', closeDropdownOutside);
    document.addEventListener('touchstart', closeDropdownOutside);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const wasOpen = langDropdown.classList.contains('show');
            langDropdown.classList.remove('show');
            langBtn.setAttribute('aria-expanded', 'false');
            if (wasOpen) {
                langBtn.focus();
            }
        }
    });

    // Handle language selection & keyboard navigation
    langOptions.forEach((option, index) => {
        const selectLang = () => {
            const selectedLang = option.getAttribute('data-lang');
            
            // Set active class in UI
            langOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.setAttribute('aria-selected', 'false');
            });
            option.classList.add('active');
            option.setAttribute('aria-selected', 'true');
            
            // Close dropdown
            langDropdown.classList.remove('show');
            langBtn.setAttribute('aria-expanded', 'false');
            langBtn.focus(); // return focus to the button

            // Apply translations
            applyLanguage(selectedLang);
        };

        option.addEventListener('click', selectLang);

        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectLang();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % langOptions.length;
                langOptions[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + langOptions.length) % langOptions.length;
                langOptions[prevIndex].focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                langDropdown.classList.remove('show');
                langBtn.setAttribute('aria-expanded', 'false');
                langBtn.focus();
            }
        });
    });

    // Function to apply translations
    function applyLanguage(lang) {
        if (!translations[lang]) return;

        safeLocalStorage.setItem('preferred-lang', lang);
        document.documentElement.lang = lang;

        // Update elements with text content (handles HTML nodes)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });

        // Update alt attributes
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            if (translations[lang][key]) {
                el.setAttribute('alt', translations[lang][key]);
            }
        });

        // Update aria-labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (translations[lang][key]) {
                el.setAttribute('aria-label', translations[lang][key]);
            }
        });

        // Update data-title for Lightbox
        document.querySelectorAll('[data-i18n-data-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-data-title');
            if (translations[lang][key]) {
                el.setAttribute('data-title', translations[lang][key]);
            }
        });

        // Update document title & meta description
        if (translations[lang].page_title) {
            document.title = translations[lang].page_title;
        }
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translations[lang].meta_description) {
            metaDesc.setAttribute('content', translations[lang].meta_description);
        }

        // Update Lightbox option dynamically
        let albumLabelText = "Hình %1 / %2";
        if (lang === 'en') albumLabelText = "Image %1 of %2";
        else if (lang === 'zh-CN') albumLabelText = "第 %1 张，共 %2 张";
        
        if (typeof lightbox !== 'undefined') {
            lightbox.option({
                'albumLabel': albumLabelText,
                'wrapAround': true,
                'fadeDuration': 300,
                'imageFadeDuration': 300
            });
        }

        // Update contact form validation messages
        updateValidationMessages(lang);
    }

    /* ==========================================================================
       FORM VALIDATION & SUBMISSION
       ========================================================================== */
    const form = document.getElementById('contact-form');
    const honeypot = document.getElementById('honeypot');
    const toast = document.getElementById('toast');

    // Dynamic validation messages object
    const validationMessages = {
        valueMissing: '',
        typeMismatch: '',
        tooShort: null
    };

    function updateValidationMessages(lang) {
        validationMessages.valueMissing = translations[lang].val_required;
        validationMessages.typeMismatch = translations[lang].val_email_format;
        validationMessages.tooShort = (min) => {
            return translations[lang].val_too_short.replace('{min}', min);
        };
    }

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

        const currentLang = safeLocalStorage.getItem('preferred-lang') || 'vi';

        // Simulating Form Submission success
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = translations[currentLang].btn_sending;

        setTimeout(() => {
            // Show toast message
            showToast(translations[currentLang].toast_success);
            
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
            submitBtn.textContent = translations[currentLang].form_submit_btn;
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
       INITIALIZE LANGUAGE PREFERENCE
       ========================================================================== */
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            const lowerLang = browserLang.toLowerCase();
            if (lowerLang.startsWith('zh')) return 'zh-CN';
            if (lowerLang.startsWith('en')) return 'en';
        }
        return 'vi'; // fallback default
    }

    let savedLang = safeLocalStorage.getItem('preferred-lang') || getBrowserLanguage();
    // Sanitize savedLang to ensure it is supported
    if (!translations[savedLang]) {
        savedLang = 'vi';
    }
    const activeOption = langDropdown.querySelector(`[data-lang="${savedLang}"]`) || langDropdown.querySelector('[data-lang="vi"]');
    if (activeOption) {
        langOptions.forEach(opt => {
            opt.classList.remove('active');
            opt.setAttribute('aria-selected', 'false');
        });
        activeOption.classList.add('active');
        activeOption.setAttribute('aria-selected', 'true');
        applyLanguage(savedLang);
    }
});
