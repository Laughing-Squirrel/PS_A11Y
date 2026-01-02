/**
 * A11Y_CONFIG_JS
 * PeopleSoft Accessibility Widget - Configuration Module
 *
 * This module provides configuration settings and constants for the
 * accessibility widget. It can optionally configure RequireJS if present.
 *
 * @version 1.0.1
 * @license MIT
 */
(function(global) {
    'use strict';

    /**
     * A11Y Configuration Object
     */
    var A11Y_CONFIG = {

        // Version information
        version: '1.0.1',
        buildDate: '2026-01-02',

        // Debug mode - set to false in production
        debug: false,

        // Feature flags
        features: {
            fontScaling: true,
            highContrast: true,
            stopAnimations: true,
            readingGuide: true,
            focusHighlight: true,
            ariaScanner: true,
            profiles: true,
            keyboardShortcuts: true
        },

        // Default settings
        defaults: {
            fontSize: 1.0,           // 1.0 = 100%
            fontSizeMin: 0.5,        // 50% - minimum allowed
            fontSizeMax: 3.0,        // 300% - maximum allowed
            fontSizeStep: 0.1,       // 10% increments
            contrastMode: 'none',    // 'none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'
            stopAnimations: false,
            readingGuide: false,
            focusHighlight: false,
            activeProfile: null,
            widgetPosition: 'right', // 'left' or 'right'
            widgetCollapsed: true,
            keyboardShortcutsEnabled: true,
            lineHeight: 1.0,
            letterSpacing: 0,
            wordSpacing: 0,
            cursorSize: 'default'
        },

        // Valid values for validation
        validValues: {
            contrastModes: ['none', 'dark', 'light', 'invert', 'yellow-black', 'black-yellow'],
            cursorSizes: ['default', 'large', 'xlarge'],
            positions: ['left', 'right']
        },

        // Timing configuration
        timing: {
            initDelay: 200,          // Delay before widget initialization
            debounceDelay: 100,      // Debounce for mutation observer
            animationDuration: 200   // CSS transition duration
        },

        // Keyboard shortcuts
        shortcuts: {
            toggleWidget: 'Alt+A',
            increaseFontSize: 'Alt+Plus',
            decreaseFontSize: 'Alt+Minus',
            resetFontSize: 'Alt+0',
            toggleHighContrast: 'Alt+C',
            toggleAnimations: 'Alt+M',
            toggleReadingGuide: 'Alt+R',
            runAriaScanner: 'Alt+S'
        },

        // Storage keys
        storage: {
            prefix: 'a11y_',
            preferencesKey: 'a11y_prefs',
            profileKey: 'a11y_profile',
            scanResultsKey: 'a11y_scan_results',
            positionKey: 'a11y_widget_position'
        },

        // PeopleSoft selectors
        selectors: {
            // Fluid UI selectors
            fluid: {
                pageContainer: '.ps_apps-fluid',
                landingPage: '#PTNUI_LAND_REC',
                labels: '.ps-label',
                buttons: '.ps-button',
                grids: '.ps-grid',
                links: '.ps-link',
                modals: '.ps-modal',
                tabs: '.ps-tabs'
            },
            // Classic UI selectors
            classic: {
                pageContainer: '#ptifrmtgtframe, #ptpgltbody',
                labels: '.PSLONGEDITBOX, .PSEDITBOX',
                buttons: '.PSPUSHBUTTON, .PSPUSHBUTTONTBHDR',
                grids: '.PSLEVEL1GRID, .PSLEVEL2GRID',
                links: '.PSHYPERLINK, .PSHYPERLINKDISABLED',
                modals: '#ptMod_1',
                tabs: '.PSTAB'
            },
            // Common selectors
            common: {
                pageInfo: '#pt_pageinfo_win0',
                targetFrame: '#ptifrmtgtframe',
                promptIcon: 'a[id*="ICSearch"], a[id*="ICList"], img.PTPROMPT',
                calendarIcon: 'a[id*="$prompt"], img[id*="CALENDAR"]',
                addRowBtn: 'a[id*="$add$"]',
                deleteRowBtn: 'a[id*="$delete$"]'
            }
        },

        // axe-core configuration
        axeConfig: {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
            },
            resultTypes: ['violations', 'incomplete'],
            // PeopleSoft-specific rules to add
            customRules: [
                'psft-prompt-icon',
                'psft-calendar-icon',
                'psft-grid-actions',
                'psft-related-actions',
                'psft-tabs-panel',
                'psft-modal-focus',
                'psft-error-message'
            ]
        },

        // CSS class names used by the widget
        cssClasses: {
            widget: 'a11y-widget',
            widgetOpen: 'a11y-widget--open',
            widgetClosed: 'a11y-widget--closed',
            widgetLeft: 'a11y-widget--left',
            widgetRight: 'a11y-widget--right',
            trigger: 'a11y-trigger',
            panel: 'a11y-panel',
            section: 'a11y-section',
            control: 'a11y-control',
            active: 'a11y-active',
            readingGuide: 'a11y-reading-guide',
            focusHighlight: 'a11y-focus-highlight',
            scanHighlight: 'a11y-scan-highlight'
        },

        // Z-index values
        zIndex: {
            widget: 999999,
            readingGuide: 999998,
            focusHighlight: 999997,
            scanOverlay: 999996
        },

        /**
         * Get a configuration value by path
         * @param {string} path - Dot-notation path (e.g., 'features.fontScaling')
         * @param {*} defaultValue - Default value if path not found
         * @returns {*} Configuration value
         */
        get: function(path, defaultValue) {
            var parts = path.split('.');
            var current = this;

            for (var i = 0; i < parts.length; i++) {
                if (current[parts[i]] === undefined) {
                    return defaultValue;
                }
                current = current[parts[i]];
            }

            return current;
        },

        /**
         * Check if a feature is enabled
         * @param {string} featureName - Feature name
         * @returns {boolean} Whether feature is enabled
         */
        isFeatureEnabled: function(featureName) {
            return this.features[featureName] === true;
        },

        /**
         * Get selectors for current UI mode
         * @param {boolean} isFluid - Whether current mode is Fluid
         * @returns {object} Selector object
         */
        getSelectors: function(isFluid) {
            return isFluid ? this.selectors.fluid : this.selectors.classic;
        },

        /**
         * Validate a value against valid options
         * @param {string} type - Type of value (e.g., 'contrastModes')
         * @param {*} value - Value to validate
         * @returns {boolean} Whether value is valid
         */
        isValidValue: function(type, value) {
            var validList = this.validValues[type];
            if (!validList) {
                return true; // No validation defined
            }
            return validList.indexOf(value) !== -1;
        },

        /**
         * Get default value for invalid input
         * @param {string} type - Type of value
         * @returns {*} Default value
         */
        getDefaultForType: function(type) {
            var defaults = {
                contrastModes: 'none',
                cursorSizes: 'default',
                positions: 'right'
            };
            return defaults[type];
        }
    };

    /**
     * Logging utility with debug mode support
     */
    var A11Y_LOG = {
        _prefix: '[A11Y]',

        log: function() {
            if (A11Y_CONFIG.debug) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this._prefix);
                console.log.apply(console, args);
            }
        },

        info: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this._prefix);
            console.log.apply(console, args);
        },

        warn: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this._prefix);
            console.warn.apply(console, args);
        },

        error: function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(this._prefix);
            console.error.apply(console, args);
        },

        group: function(label) {
            if (A11Y_CONFIG.debug && console.group) {
                console.group(this._prefix + ' ' + label);
            }
        },

        groupEnd: function() {
            if (A11Y_CONFIG.debug && console.groupEnd) {
                console.groupEnd();
            }
        }
    };

    // Configure RequireJS if available
    if (typeof require !== 'undefined' && typeof require.config === 'function') {
        require.config({
            baseUrl: '/cs/ps/cache/',  // Adjust based on your PeopleSoft configuration
            paths: {
                'a11y-core': 'A11Y_CORE_JS',
                'a11y-styles': 'A11Y_STYLES_JS',
                'a11y-profiles': 'A11Y_PROFILES_JS',
                'a11y-psft-hooks': 'A11Y_PSFT_HOOKS_JS',
                'a11y-aria-scanner': 'A11Y_ARIA_SCANNER_JS',
                'axe': 'A11Y_AXE_CORE_JS'
            },
            shim: {
                'axe': {
                    exports: 'axe'
                }
            }
        });
        A11Y_LOG.log('RequireJS configured');
    }

    // Expose configuration and logging globally
    global.A11Y_CONFIG = A11Y_CONFIG;
    global.A11Y_LOG = A11Y_LOG;

    A11Y_LOG.info('Configuration loaded - v' + A11Y_CONFIG.version);

})(window);
