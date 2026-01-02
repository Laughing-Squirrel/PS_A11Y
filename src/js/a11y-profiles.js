/**
 * A11Y_PROFILES_JS
 * PeopleSoft Accessibility Widget - Disability Profile Presets
 *
 * This module provides pre-configured accessibility profiles for common
 * disability types, allowing users to quickly apply relevant settings.
 *
 * @version 1.0.1
 * @license MIT
 */
(function(a11yJQ) {
    'use strict';

    // Ensure dependencies are available
    if (typeof a11yJQ === 'undefined') {
        console.error('[A11Y] a11yJQ not available. Load a11y-jquery-noconflict.js first.');
        return;
    }

    var CONFIG = window.A11Y_CONFIG || { storage: { profileKey: 'a11y_profile' } };

    /**
     * Accessibility Profiles Module
     */
    var A11Y_PROFILES = {

        // Currently active profile
        _activeProfile: null,

        // Profile definitions
        profiles: {

            /**
             * Visual Impairment - Low Vision
             * For users with reduced visual acuity
             */
            'low-vision': {
                id: 'low-vision',
                name: 'Low Vision',
                description: 'Larger text, enhanced contrast, and improved focus visibility',
                icon: 'eye',
                settings: {
                    fontSize: 1.5,
                    contrastMode: 'none',
                    focusHighlight: true,
                    lineHeight: 1.3,
                    letterSpacing: 1,
                    cursorSize: 'large',
                    linkHighlight: true
                }
            },

            /**
             * Visual Impairment - Color Blindness
             * For users with color vision deficiency
             */
            'color-blind': {
                id: 'color-blind',
                name: 'Color Blind Friendly',
                description: 'Enhanced contrast without relying on color alone',
                icon: 'palette',
                settings: {
                    fontSize: 1.1,
                    contrastMode: 'light',
                    focusHighlight: true,
                    linkHighlight: true
                }
            },

            /**
             * Visual Impairment - Light Sensitivity
             * For users sensitive to bright light
             */
            'light-sensitive': {
                id: 'light-sensitive',
                name: 'Light Sensitive',
                description: 'Dark mode with reduced brightness',
                icon: 'brightness-low',
                settings: {
                    contrastMode: 'dark',
                    stopAnimations: true
                }
            },

            /**
             * Motor Impairment
             * For users with limited fine motor control
             */
            'motor-impaired': {
                id: 'motor-impaired',
                name: 'Motor Accessibility',
                description: 'Larger click targets and enhanced focus indicators',
                icon: 'hand',
                settings: {
                    fontSize: 1.2,
                    focusHighlight: true,
                    cursorSize: 'xlarge',
                    lineHeight: 1.2
                }
            },

            /**
             * Cognitive - Dyslexia
             * Settings optimized for users with dyslexia
             */
            'dyslexia': {
                id: 'dyslexia',
                name: 'Dyslexia Friendly',
                description: 'Improved readability with optimized spacing and reading guide',
                icon: 'book',
                settings: {
                    fontSize: 1.2,
                    lineHeight: 1.5,
                    letterSpacing: 2,
                    wordSpacing: 4,
                    readingGuide: true,
                    contrastMode: 'none'
                }
            },

            /**
             * Cognitive - ADHD
             * Reduce distractions for users with attention disorders
             */
            'adhd-friendly': {
                id: 'adhd-friendly',
                name: 'ADHD Friendly',
                description: 'Reduced distractions and animations',
                icon: 'focus',
                settings: {
                    stopAnimations: true,
                    focusHighlight: true,
                    readingGuide: true
                }
            },

            /**
             * Seizure Safe
             * Prevent seizure triggers
             */
            'seizure-safe': {
                id: 'seizure-safe',
                name: 'Seizure Safe',
                description: 'Stops all animations and flashing content',
                icon: 'shield',
                settings: {
                    stopAnimations: true,
                    contrastMode: 'none'
                }
            },

            /**
             * Screen Reader Optimized
             * Optimizations for screen reader users
             */
            'screen-reader': {
                id: 'screen-reader',
                name: 'Screen Reader Optimized',
                description: 'Enhanced structure and navigation for screen readers',
                icon: 'speaker',
                settings: {
                    stopAnimations: true,
                    focusHighlight: true
                },
                // Additional ARIA enhancements applied via callback
                onActivate: function() {
                    // Add skip links if not present
                    A11Y_PROFILES._ensureSkipLinks();
                    // Enhance landmark roles
                    A11Y_PROFILES._enhanceLandmarks();
                }
            },

            /**
             * High Contrast - Dark
             * Maximum contrast with dark background
             */
            'high-contrast-dark': {
                id: 'high-contrast-dark',
                name: 'High Contrast (Dark)',
                description: 'White text on black background',
                icon: 'contrast',
                settings: {
                    contrastMode: 'dark',
                    fontSize: 1.1,
                    focusHighlight: true
                }
            },

            /**
             * High Contrast - Light
             * Maximum contrast with light background
             */
            'high-contrast-light': {
                id: 'high-contrast-light',
                name: 'High Contrast (Light)',
                description: 'Black text on white background',
                icon: 'contrast',
                settings: {
                    contrastMode: 'light',
                    fontSize: 1.1,
                    focusHighlight: true
                }
            },

            /**
             * Senior Friendly
             * Comprehensive settings for elderly users
             */
            'senior-friendly': {
                id: 'senior-friendly',
                name: 'Senior Friendly',
                description: 'Larger text, simplified navigation, enhanced visibility',
                icon: 'elderly',
                settings: {
                    fontSize: 1.4,
                    lineHeight: 1.4,
                    contrastMode: 'light',
                    focusHighlight: true,
                    cursorSize: 'large',
                    linkHighlight: true,
                    stopAnimations: true
                }
            }
        },

        /**
         * Get all available profiles
         * @returns {object[]} Array of profile objects
         */
        getProfiles: function() {
            var self = this;
            return Object.keys(this.profiles).map(function(key) {
                return self.profiles[key];
            });
        },

        /**
         * Get a specific profile by ID
         * @param {string} profileId - Profile identifier
         * @returns {object|null} Profile object or null
         */
        getProfile: function(profileId) {
            return this.profiles[profileId] || null;
        },

        /**
         * Get the currently active profile
         * @returns {object|null} Active profile or null
         */
        getActiveProfile: function() {
            return this._activeProfile;
        },

        /**
         * Apply a profile
         * @param {string} profileId - Profile identifier
         * @returns {boolean} Success status
         */
        applyProfile: function(profileId) {
            var profile = this.getProfile(profileId);

            if (!profile) {
                console.error('[A11Y] Profile not found:', profileId);
                return false;
            }

            // Check if A11Y_STYLES is available
            if (typeof window.A11Y_STYLES === 'undefined') {
                console.error('[A11Y] A11Y_STYLES not available. Load a11y-styles.js first.');
                return false;
            }

            // Reset current styles first
            window.A11Y_STYLES.resetAll();

            // Apply profile settings
            var settings = profile.settings;

            if (settings.fontSize) {
                window.A11Y_STYLES.setFontSize(settings.fontSize);
            }
            if (settings.contrastMode) {
                window.A11Y_STYLES.setHighContrast(settings.contrastMode);
            }
            if (settings.stopAnimations) {
                window.A11Y_STYLES.setStopAnimations(true);
            }
            if (settings.readingGuide) {
                window.A11Y_STYLES.setReadingGuide(true);
            }
            if (settings.focusHighlight) {
                window.A11Y_STYLES.setFocusHighlight(true);
            }
            if (settings.lineHeight) {
                window.A11Y_STYLES.setLineHeight(settings.lineHeight);
            }
            if (settings.letterSpacing) {
                window.A11Y_STYLES.setLetterSpacing(settings.letterSpacing);
            }
            if (settings.wordSpacing) {
                window.A11Y_STYLES.setWordSpacing(settings.wordSpacing);
            }
            if (settings.cursorSize) {
                window.A11Y_STYLES.setCursorSize(settings.cursorSize);
            }
            if (settings.linkHighlight) {
                window.A11Y_STYLES.setLinkHighlight(true);
            }

            // Execute profile-specific callback if present
            if (typeof profile.onActivate === 'function') {
                profile.onActivate();
            }

            // Store active profile
            this._activeProfile = profile;
            this._saveActiveProfile(profileId);

            console.log('[A11Y] Profile applied:', profile.name);

            // Dispatch event
            this._dispatchEvent('profileApplied', { profile: profile });

            return true;
        },

        /**
         * Deactivate current profile
         */
        deactivateProfile: function() {
            if (window.A11Y_STYLES) {
                window.A11Y_STYLES.resetAll();
            }

            var previousProfile = this._activeProfile;
            this._activeProfile = null;
            this._saveActiveProfile(null);

            // Dispatch event
            this._dispatchEvent('profileDeactivated', { previousProfile: previousProfile });

            console.log('[A11Y] Profile deactivated');
        },

        /**
         * Save active profile to localStorage
         * @private
         */
        _saveActiveProfile: function(profileId) {
            try {
                if (profileId) {
                    localStorage.setItem(CONFIG.storage.profileKey, profileId);
                } else {
                    localStorage.removeItem(CONFIG.storage.profileKey);
                }
            } catch (e) {
                console.warn('[A11Y] Could not save profile:', e);
            }
        },

        /**
         * Load and apply saved profile
         */
        loadSavedProfile: function() {
            try {
                var profileId = localStorage.getItem(CONFIG.storage.profileKey);
                if (profileId && this.profiles[profileId]) {
                    this.applyProfile(profileId);
                    return true;
                }
            } catch (e) {
                console.warn('[A11Y] Could not load saved profile:', e);
            }
            return false;
        },

        /**
         * Ensure skip links are present
         * @private
         */
        _ensureSkipLinks: function() {
            if (document.getElementById('a11y-skip-links')) {
                return;
            }

            var skipContainer = document.createElement('div');
            skipContainer.id = 'a11y-skip-links';

            // Use createElement instead of innerHTML to avoid XSS patterns
            var skipLinks = [
                { href: '#main-content', text: 'Skip to main content' },
                { href: '#navigation', text: 'Skip to navigation' }
            ];

            skipLinks.forEach(function(linkData) {
                var link = document.createElement('a');
                link.href = linkData.href;
                link.className = 'a11y-skip-link';
                link.textContent = linkData.text;
                skipContainer.appendChild(link);
            });

            // Add styles for skip links
            var style = document.createElement('style');
            style.textContent = [
                '.a11y-skip-link {',
                '  position: fixed;',
                '  top: -100px;',
                '  left: 10px;',
                '  background: #000;',
                '  color: #fff;',
                '  padding: 10px 20px;',
                '  z-index: 999999;',
                '  text-decoration: none;',
                '  font-weight: bold;',
                '}',
                '.a11y-skip-link:focus {',
                '  top: 10px;',
                '}'
            ].join('\n');
            document.head.appendChild(style);

            document.body.insertBefore(skipContainer, document.body.firstChild);
        },

        /**
         * Enhance landmark roles for screen readers
         * @private
         */
        _enhanceLandmarks: function() {
            // Add role="main" to main content area if not present
            var mainContent = document.querySelector('.ps_apps-fluid') ||
                             document.querySelector('#ptpgltbody') ||
                             document.querySelector('main');

            if (mainContent && !mainContent.hasAttribute('role')) {
                mainContent.setAttribute('role', 'main');
                mainContent.id = mainContent.id || 'main-content';
            }

            // Add role="navigation" to nav areas
            var navAreas = document.querySelectorAll('.PTNUI_NAVBAR, .ps_apps-navbar, nav');
            navAreas.forEach(function(nav) {
                if (!nav.hasAttribute('role')) {
                    nav.setAttribute('role', 'navigation');
                    nav.id = nav.id || 'navigation';
                }
            });
        },

        /**
         * Create a custom profile
         * @param {string} id - Profile ID
         * @param {object} config - Profile configuration
         * @returns {boolean} Success status
         */
        createCustomProfile: function(id, config) {
            if (this.profiles[id]) {
                console.warn('[A11Y] Profile already exists:', id);
                return false;
            }

            if (!config.name || !config.settings) {
                console.error('[A11Y] Invalid profile configuration');
                return false;
            }

            this.profiles[id] = {
                id: id,
                name: config.name,
                description: config.description || '',
                icon: config.icon || 'custom',
                settings: config.settings,
                custom: true
            };

            return true;
        },

        /**
         * Delete a custom profile
         * @param {string} id - Profile ID
         * @returns {boolean} Success status
         */
        deleteCustomProfile: function(id) {
            if (!this.profiles[id] || !this.profiles[id].custom) {
                console.warn('[A11Y] Cannot delete built-in profile:', id);
                return false;
            }

            delete this.profiles[id];

            if (this._activeProfile && this._activeProfile.id === id) {
                this.deactivateProfile();
            }

            return true;
        },

        /**
         * Dispatch custom event
         * @private
         */
        _dispatchEvent: function(eventName, detail) {
            // Use try-catch for CustomEvent compatibility with older browsers
            try {
                var event = new CustomEvent('a11y:' + eventName, { detail: detail });
                document.dispatchEvent(event);
            } catch (e) {
                // Fallback for older browsers
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent('a11y:' + eventName, true, true, detail);
                document.dispatchEvent(evt);
            }
        },

        /**
         * Initialize the profiles module
         */
        init: function() {
            // Load saved profile on init
            this.loadSavedProfile();
            console.log('[A11Y] Profiles module initialized');
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            A11Y_PROFILES.init();
        });
    } else {
        // Small delay to ensure A11Y_STYLES is initialized first
        setTimeout(function() {
            A11Y_PROFILES.init();
        }, 100);
    }

    // Expose globally
    window.A11Y_PROFILES = A11Y_PROFILES;

})(window.a11yJQ);
