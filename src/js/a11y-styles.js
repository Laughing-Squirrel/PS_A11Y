/**
 * A11Y_STYLES_JS
 * PeopleSoft Accessibility Widget - Dynamic Style Injection Engine
 *
 * This module provides runtime CSS manipulation with support for:
 * - Font size scaling
 * - High contrast modes
 * - Animation stopping
 * - Reading guide
 * - Focus highlighting
 * - User preference persistence via localStorage
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

    var CONFIG = window.A11Y_CONFIG || {
        storage: { preferencesKey: 'a11y_prefs' },
        defaults: {
            fontSizeMin: 0.5,
            fontSizeMax: 3.0,
            fontSize: 1.0,
            contrastMode: 'none',
            cursorSize: 'default'
        },
        validValues: {
            contrastModes: ['none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'],
            cursorSizes: ['default', 'large', 'xlarge']
        },
        zIndex: {
            readingGuide: 999998
        }
    };

    var LOG = window.A11Y_LOG || {
        log: function() {},
        info: function() { console.log.apply(console, ['[A11Y]'].concat(Array.prototype.slice.call(arguments))); },
        warn: function() { console.warn.apply(console, ['[A11Y]'].concat(Array.prototype.slice.call(arguments))); },
        error: function() { console.error.apply(console, ['[A11Y]'].concat(Array.prototype.slice.call(arguments))); }
    };

    /**
     * Dynamic Style Injection Module
     */
    var A11Y_STYLES = {

        // State
        _initialized: false,
        _styleElement: null,
        _readingGuideElement: null,
        _currentRules: {},
        _eventHandlers: {}, // Store event handlers for cleanup
        _settings: {
            fontSize: 1.0,
            contrastMode: 'none',
            stopAnimations: false,
            readingGuide: false,
            focusHighlight: false,
            lineHeight: 1.0,
            letterSpacing: 0,
            wordSpacing: 0,
            cursorSize: 'default',
            linkHighlight: false
        },

        /**
         * Initialize the styles module
         */
        init: function() {
            if (this._initialized) {
                return;
            }

            this._createStyleElement();
            this._createReadingGuide();
            this._loadSavedPreferences();
            this._setupFocusHighlight();

            this._initialized = true;
            LOG.info('Styles module initialized');
        },

        /**
         * Create the dynamic style element
         * @private
         */
        _createStyleElement: function() {
            // Remove existing if present
            var existing = document.getElementById('a11y-dynamic-styles');
            if (existing) {
                existing.parentNode.removeChild(existing);
            }

            this._styleElement = document.createElement('style');
            this._styleElement.id = 'a11y-dynamic-styles';
            this._styleElement.setAttribute('data-a11y', 'true');
            document.head.appendChild(this._styleElement);
        },

        /**
         * Create reading guide element
         * @private
         */
        _createReadingGuide: function() {
            // Remove existing if present
            var existing = document.getElementById('a11y-reading-guide');
            if (existing) {
                existing.parentNode.removeChild(existing);
            }

            this._readingGuideElement = document.createElement('div');
            this._readingGuideElement.id = 'a11y-reading-guide';
            this._readingGuideElement.setAttribute('aria-hidden', 'true');
            this._readingGuideElement.style.cssText = [
                'position: fixed',
                'left: 0',
                'width: 100%',
                'height: 30px',
                'background: rgba(255, 255, 0, 0.3)',
                'pointer-events: none',
                'z-index: ' + (CONFIG.zIndex.readingGuide || 999998),
                'display: none',
                'border-top: 2px solid #ff0',
                'border-bottom: 2px solid #ff0'
            ].join(';');

            document.body.appendChild(this._readingGuideElement);

            // Track mouse movement for reading guide (with passive listener)
            var self = this;
            this._eventHandlers.mousemove = function(e) {
                if (self._settings.readingGuide && self._readingGuideElement) {
                    self._readingGuideElement.style.top = (e.clientY - 15) + 'px';
                }
            };
            document.addEventListener('mousemove', this._eventHandlers.mousemove, { passive: true });
        },

        /**
         * Setup focus highlight tracking
         * @private
         */
        _setupFocusHighlight: function() {
            var self = this;

            this._eventHandlers.focusin = function(e) {
                if (self._settings.focusHighlight && e.target) {
                    self._highlightElement(e.target);
                }
            };

            this._eventHandlers.focusout = function(e) {
                if (self._settings.focusHighlight && e.target) {
                    self._removeHighlight(e.target);
                }
            };

            document.addEventListener('focusin', this._eventHandlers.focusin);
            document.addEventListener('focusout', this._eventHandlers.focusout);
        },

        /**
         * Highlight focused element
         * @private
         */
        _highlightElement: function(element) {
            if (element && element.setAttribute) {
                element.setAttribute('data-a11y-focus', 'true');
            }
        },

        /**
         * Remove highlight from element
         * @private
         */
        _removeHighlight: function(element) {
            if (element && element.removeAttribute) {
                element.removeAttribute('data-a11y-focus');
            }
        },

        // ==================== FONT SIZE ====================

        /**
         * Set font size scale
         * @param {number} scale - Scale factor (1.0 = 100%)
         * @returns {object} this - for chaining
         */
        setFontSize: function(scale) {
            // Validate and clamp
            if (typeof scale !== 'number' || isNaN(scale)) {
                LOG.warn('Invalid font size scale:', scale);
                scale = CONFIG.defaults.fontSize;
            }

            var min = CONFIG.defaults.fontSizeMin || 0.5;
            var max = CONFIG.defaults.fontSizeMax || 3.0;
            scale = Math.max(min, Math.min(max, scale));

            this._settings.fontSize = scale;

            if (scale === 1.0) {
                delete this._currentRules.fontSize;
            } else {
                this._currentRules.fontSize = [
                    'html { font-size: ' + (scale * 100) + '% !important; }',
                    'body, body * { font-size: inherit; }'
                ].join('\n');
            }

            this._applyRules();
            return this;
        },

        /**
         * Increase font size by step
         * @param {number} step - Step amount (default from config)
         * @returns {object} this - for chaining
         */
        increaseFontSize: function(step) {
            step = step || CONFIG.defaults.fontSizeStep || 0.1;
            return this.setFontSize(this._settings.fontSize + step);
        },

        /**
         * Decrease font size by step
         * @param {number} step - Step amount (default from config)
         * @returns {object} this - for chaining
         */
        decreaseFontSize: function(step) {
            step = step || CONFIG.defaults.fontSizeStep || 0.1;
            return this.setFontSize(this._settings.fontSize - step);
        },

        /**
         * Reset font size to default
         * @returns {object} this - for chaining
         */
        resetFontSize: function() {
            return this.setFontSize(CONFIG.defaults.fontSize || 1.0);
        },

        /**
         * Get current font size
         * @returns {number} Current scale factor
         */
        getFontSize: function() {
            return this._settings.fontSize;
        },

        // ==================== HIGH CONTRAST ====================

        /**
         * Set high contrast mode
         * @param {string} mode - 'none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'
         * @returns {object} this - for chaining
         */
        setHighContrast: function(mode) {
            // Validate mode
            var validModes = CONFIG.validValues.contrastModes ||
                ['none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'];

            if (validModes.indexOf(mode) === -1) {
                LOG.warn('Invalid contrast mode:', mode, '- defaulting to none');
                mode = 'none';
            }

            this._settings.contrastMode = mode;

            var rules = {
                'none': '',

                'dark': [
                    'html { filter: invert(1) hue-rotate(180deg); }',
                    'img, video, picture, canvas, svg, [style*="background-image"] {',
                    '  filter: invert(1) hue-rotate(180deg);',
                    '}'
                ].join('\n'),

                'light': [
                    'body {',
                    '  background: #fff !important;',
                    '  color: #000 !important;',
                    '}',
                    'body * {',
                    '  background-color: inherit;',
                    '  color: inherit;',
                    '  border-color: #000 !important;',
                    '}',
                    'a, a * { color: #0000EE !important; }',
                    'a:visited, a:visited * { color: #551A8B !important; }'
                ].join('\n'),

                'invert': 'html { filter: invert(1); }',

                'yellow-black': [
                    'body {',
                    '  background: #000 !important;',
                    '  color: #ff0 !important;',
                    '}',
                    'body * {',
                    '  background-color: #000 !important;',
                    '  color: #ff0 !important;',
                    '  border-color: #ff0 !important;',
                    '}',
                    'a, a * { color: #ff0 !important; text-decoration: underline !important; }',
                    'img, video { filter: grayscale(1); }'
                ].join('\n'),

                'black-yellow': [
                    'body {',
                    '  background: #ff0 !important;',
                    '  color: #000 !important;',
                    '}',
                    'body * {',
                    '  background-color: #ff0 !important;',
                    '  color: #000 !important;',
                    '  border-color: #000 !important;',
                    '}',
                    'a, a * { color: #000 !important; text-decoration: underline !important; }'
                ].join('\n')
            };

            this._currentRules.contrast = rules[mode] || '';
            this._applyRules();
            return this;
        },

        /**
         * Get current contrast mode
         * @returns {string} Current mode
         */
        getContrastMode: function() {
            return this._settings.contrastMode;
        },

        /**
         * Toggle through contrast modes
         * @returns {object} this - for chaining
         */
        toggleContrast: function() {
            var modes = CONFIG.validValues.contrastModes ||
                ['none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'];
            var currentIndex = modes.indexOf(this._settings.contrastMode);
            var nextIndex = (currentIndex + 1) % modes.length;
            return this.setHighContrast(modes[nextIndex]);
        },

        // ==================== ANIMATIONS ====================

        /**
         * Stop/enable animations
         * @param {boolean} stop - True to stop animations
         * @returns {object} this - for chaining
         */
        setStopAnimations: function(stop) {
            this._settings.stopAnimations = Boolean(stop);

            if (stop) {
                this._currentRules.animations = [
                    '*, *::before, *::after {',
                    '  animation: none !important;',
                    '  animation-duration: 0.001s !important;',
                    '  transition: none !important;',
                    '  transition-duration: 0.001s !important;',
                    '}'
                ].join('\n');

                // Pause videos safely
                try {
                    var videos = document.querySelectorAll('video');
                    for (var i = 0; i < videos.length; i++) {
                        videos[i].pause();
                    }
                } catch (e) {
                    LOG.warn('Could not pause videos:', e.message);
                }
            } else {
                delete this._currentRules.animations;
            }

            this._applyRules();
            return this;
        },

        /**
         * Toggle animation stopping
         * @returns {object} this - for chaining
         */
        toggleAnimations: function() {
            return this.setStopAnimations(!this._settings.stopAnimations);
        },

        // ==================== READING GUIDE ====================

        /**
         * Enable/disable reading guide
         * @param {boolean} enabled - True to enable
         * @returns {object} this - for chaining
         */
        setReadingGuide: function(enabled) {
            this._settings.readingGuide = Boolean(enabled);

            if (this._readingGuideElement) {
                this._readingGuideElement.style.display = enabled ? 'block' : 'none';
            }

            return this;
        },

        /**
         * Toggle reading guide
         * @returns {object} this - for chaining
         */
        toggleReadingGuide: function() {
            return this.setReadingGuide(!this._settings.readingGuide);
        },

        // ==================== FOCUS HIGHLIGHT ====================

        /**
         * Enable/disable focus highlighting
         * @param {boolean} enabled - True to enable
         * @returns {object} this - for chaining
         */
        setFocusHighlight: function(enabled) {
            this._settings.focusHighlight = Boolean(enabled);

            if (enabled) {
                this._currentRules.focusHighlight = [
                    '[data-a11y-focus="true"] {',
                    '  outline: 3px solid #ff6600 !important;',
                    '  outline-offset: 2px !important;',
                    '  box-shadow: 0 0 10px 3px rgba(255, 102, 0, 0.5) !important;',
                    '}',
                    '*:focus {',
                    '  outline: 3px solid #0066ff !important;',
                    '  outline-offset: 2px !important;',
                    '}'
                ].join('\n');
            } else {
                delete this._currentRules.focusHighlight;
            }

            this._applyRules();
            return this;
        },

        /**
         * Toggle focus highlighting
         * @returns {object} this - for chaining
         */
        toggleFocusHighlight: function() {
            return this.setFocusHighlight(!this._settings.focusHighlight);
        },

        // ==================== ADDITIONAL FEATURES ====================

        /**
         * Set line height
         * @param {number} scale - Scale factor (1.0 = normal)
         * @returns {object} this - for chaining
         */
        setLineHeight: function(scale) {
            if (typeof scale !== 'number' || isNaN(scale)) {
                scale = 1.0;
            }
            scale = Math.max(1.0, Math.min(3.0, scale));
            this._settings.lineHeight = scale;

            if (scale === 1.0) {
                delete this._currentRules.lineHeight;
            } else {
                this._currentRules.lineHeight =
                    'body, body * { line-height: ' + (scale * 1.5) + ' !important; }';
            }

            this._applyRules();
            return this;
        },

        /**
         * Set letter spacing
         * @param {number} pixels - Extra spacing in pixels
         * @returns {object} this - for chaining
         */
        setLetterSpacing: function(pixels) {
            if (typeof pixels !== 'number' || isNaN(pixels)) {
                pixels = 0;
            }
            pixels = Math.max(0, Math.min(10, pixels));
            this._settings.letterSpacing = pixels;

            if (pixels === 0) {
                delete this._currentRules.letterSpacing;
            } else {
                this._currentRules.letterSpacing =
                    'body, body * { letter-spacing: ' + pixels + 'px !important; }';
            }

            this._applyRules();
            return this;
        },

        /**
         * Set word spacing
         * @param {number} pixels - Extra spacing in pixels
         * @returns {object} this - for chaining
         */
        setWordSpacing: function(pixels) {
            if (typeof pixels !== 'number' || isNaN(pixels)) {
                pixels = 0;
            }
            pixels = Math.max(0, Math.min(20, pixels));
            this._settings.wordSpacing = pixels;

            if (pixels === 0) {
                delete this._currentRules.wordSpacing;
            } else {
                this._currentRules.wordSpacing =
                    'body, body * { word-spacing: ' + pixels + 'px !important; }';
            }

            this._applyRules();
            return this;
        },

        /**
         * Set cursor size
         * @param {string} size - 'default', 'large', 'xlarge'
         * @returns {object} this - for chaining
         */
        setCursorSize: function(size) {
            // Validate size
            var validSizes = CONFIG.validValues.cursorSizes || ['default', 'large', 'xlarge'];
            if (validSizes.indexOf(size) === -1) {
                LOG.warn('Invalid cursor size:', size, '- defaulting to default');
                size = 'default';
            }

            this._settings.cursorSize = size;

            var cursors = {
                'default': '',
                'large': [
                    'body, body * {',
                    '  cursor: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'%3E%3Cpath d=\'M0 0 L0 24 L6 18 L12 28 L16 26 L10 16 L18 16 Z\' fill=\'black\' stroke=\'white\'/%3E%3C/svg%3E") 0 0, auto !important;',
                    '}'
                ].join('\n'),
                'xlarge': [
                    'body, body * {',
                    '  cursor: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\'%3E%3Cpath d=\'M0 0 L0 36 L9 27 L18 42 L24 39 L15 24 L27 24 Z\' fill=\'black\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E") 0 0, auto !important;',
                    '}'
                ].join('\n')
            };

            this._currentRules.cursor = cursors[size] || '';
            this._applyRules();
            return this;
        },

        /**
         * Highlight all links
         * @param {boolean} enabled - True to enable
         * @returns {object} this - for chaining
         */
        setLinkHighlight: function(enabled) {
            this._settings.linkHighlight = Boolean(enabled);

            if (enabled) {
                this._currentRules.linkHighlight = [
                    'a, a * {',
                    '  background-color: #ffff00 !important;',
                    '  color: #0000ff !important;',
                    '  text-decoration: underline !important;',
                    '  padding: 2px !important;',
                    '}'
                ].join('\n');
            } else {
                delete this._currentRules.linkHighlight;
            }

            this._applyRules();
            return this;
        },

        // ==================== CORE METHODS ====================

        /**
         * Apply all current rules to the style element
         * @private
         */
        _applyRules: function() {
            if (!this._styleElement) {
                LOG.warn('Style element not available');
                return;
            }

            // Object.values polyfill for compatibility
            var rules = this._currentRules;
            var values = [];
            for (var key in rules) {
                if (rules.hasOwnProperty(key) && rules[key]) {
                    values.push(rules[key]);
                }
            }

            var css = values.join('\n\n');
            this._styleElement.textContent = css;
            this._savePreferences();
        },

        /**
         * Save preferences to localStorage
         * @private
         */
        _savePreferences: function() {
            try {
                var prefs = JSON.stringify(this._settings);
                localStorage.setItem(CONFIG.storage.preferencesKey, prefs);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    LOG.warn('localStorage quota exceeded, trying sessionStorage');
                    try {
                        sessionStorage.setItem(CONFIG.storage.preferencesKey, JSON.stringify(this._settings));
                    } catch (e2) {
                        LOG.warn('Could not save preferences:', e2.message);
                    }
                } else {
                    LOG.warn('Could not save preferences:', e.message);
                }
            }
        },

        /**
         * Load saved preferences from localStorage
         * @private
         */
        _loadSavedPreferences: function() {
            try {
                var saved = localStorage.getItem(CONFIG.storage.preferencesKey);
                if (!saved) {
                    saved = sessionStorage.getItem(CONFIG.storage.preferencesKey);
                }
                if (saved) {
                    var prefs = JSON.parse(saved);
                    this._applyPreferences(prefs);
                }
            } catch (e) {
                LOG.warn('Could not load preferences:', e.message);
            }
        },

        /**
         * Apply a preferences object
         * @private
         */
        _applyPreferences: function(prefs) {
            if (!prefs || typeof prefs !== 'object') {
                return;
            }

            if (prefs.fontSize && prefs.fontSize !== 1.0) {
                this.setFontSize(prefs.fontSize);
            }
            if (prefs.contrastMode && prefs.contrastMode !== 'none') {
                this.setHighContrast(prefs.contrastMode);
            }
            if (prefs.stopAnimations) {
                this.setStopAnimations(true);
            }
            if (prefs.readingGuide) {
                this.setReadingGuide(true);
            }
            if (prefs.focusHighlight) {
                this.setFocusHighlight(true);
            }
            if (prefs.lineHeight && prefs.lineHeight !== 1.0) {
                this.setLineHeight(prefs.lineHeight);
            }
            if (prefs.letterSpacing) {
                this.setLetterSpacing(prefs.letterSpacing);
            }
            if (prefs.wordSpacing) {
                this.setWordSpacing(prefs.wordSpacing);
            }
            if (prefs.cursorSize && prefs.cursorSize !== 'default') {
                this.setCursorSize(prefs.cursorSize);
            }
            if (prefs.linkHighlight) {
                this.setLinkHighlight(true);
            }
        },

        /**
         * Get all current settings
         * @returns {object} Current settings (copy)
         */
        getSettings: function() {
            var copy = {};
            for (var key in this._settings) {
                if (this._settings.hasOwnProperty(key)) {
                    copy[key] = this._settings[key];
                }
            }
            return copy;
        },

        /**
         * Reset all styles to default
         * @returns {object} this - for chaining
         */
        resetAll: function() {
            this._settings = {
                fontSize: CONFIG.defaults.fontSize || 1.0,
                contrastMode: CONFIG.defaults.contrastMode || 'none',
                stopAnimations: false,
                readingGuide: false,
                focusHighlight: false,
                lineHeight: CONFIG.defaults.lineHeight || 1.0,
                letterSpacing: CONFIG.defaults.letterSpacing || 0,
                wordSpacing: CONFIG.defaults.wordSpacing || 0,
                cursorSize: CONFIG.defaults.cursorSize || 'default',
                linkHighlight: false
            };
            this._currentRules = {};
            this._applyRules();

            if (this._readingGuideElement) {
                this._readingGuideElement.style.display = 'none';
            }

            return this;
        },

        /**
         * Destroy the module and clean up
         */
        destroy: function() {
            // Remove event listeners
            if (this._eventHandlers.mousemove) {
                document.removeEventListener('mousemove', this._eventHandlers.mousemove);
            }
            if (this._eventHandlers.focusin) {
                document.removeEventListener('focusin', this._eventHandlers.focusin);
            }
            if (this._eventHandlers.focusout) {
                document.removeEventListener('focusout', this._eventHandlers.focusout);
            }
            this._eventHandlers = {};

            // Remove DOM elements
            if (this._styleElement && this._styleElement.parentNode) {
                this._styleElement.parentNode.removeChild(this._styleElement);
            }
            if (this._readingGuideElement && this._readingGuideElement.parentNode) {
                this._readingGuideElement.parentNode.removeChild(this._readingGuideElement);
            }

            this._styleElement = null;
            this._readingGuideElement = null;
            this._initialized = false;

            LOG.log('Styles module destroyed');
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            A11Y_STYLES.init();
        });
    } else {
        A11Y_STYLES.init();
    }

    // Expose globally
    window.A11Y_STYLES = A11Y_STYLES;

})(window.a11yJQ);
