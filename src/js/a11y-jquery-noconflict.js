/**
 * A11Y_JQUERY_NOCONFLICT_JS
 * PeopleSoft Accessibility Widget - jQuery NoConflict Wrapper
 *
 * This module manages jQuery for the A11Y widget. By default, it uses
 * PeopleSoft's native jQuery if it meets minimum version requirements,
 * avoiding unnecessary duplicate loading.
 *
 * LOADING PRIORITY (default behavior):
 * 1. PeopleSoft's native jQuery (if version >= minimum required)
 * 2. Embedded jQuery (if pasted at placeholder below)
 * 3. CDN fallback (code.jquery.com with cdnjs.cloudflare.com backup)
 *
 * CONFIGURATION:
 * - JQUERY_MIN_VERSION: Minimum required version (default: '1.12.0')
 * - PREFER_NATIVE: Use PeopleSoft's jQuery when compatible (default: true)
 * - JQUERY_CDN_VERSION: Version to load from CDN if needed (default: '3.7.1')
 *
 * The widget's jQuery reference is accessible via window.a11yJQ
 *
 * @version 1.0.2
 * @license MIT
 */
(function() {
    'use strict';

    // ============================================================
    // CONFIGURATION - Modify these settings as needed
    // ============================================================

    var CONFIG = {
        // Minimum jQuery version required for the widget to function
        // PeopleSoft 8.55+ typically includes jQuery 1.12.x
        // PeopleSoft 8.57+ typically includes jQuery 3.x
        JQUERY_MIN_VERSION: '1.12.0',

        // Prefer using PeopleSoft's native jQuery when it meets minimum version
        // Set to false to always load a separate jQuery instance
        PREFER_NATIVE: true,

        // jQuery version to load from CDN if native is unavailable/incompatible
        JQUERY_CDN_VERSION: '3.7.1',

        // CDN URLs (primary and fallback)
        JQUERY_CDN_URL: 'https://code.jquery.com/jquery-3.7.1.min.js',
        JQUERY_CDN_FALLBACK: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',

        // Timeout for CDN loading (milliseconds)
        LOAD_TIMEOUT: 10000
    };

    // ============================================================

    // Store existing jQuery references if present
    var _jQuery = window.jQuery;
    var _$ = window.$;

    /**
     * Compare two version strings (e.g., '1.12.0' vs '3.7.1')
     * @param {string} version - Version to check
     * @param {string} minVersion - Minimum required version
     * @returns {boolean} True if version >= minVersion
     */
    function isVersionCompatible(version, minVersion) {
        if (!version || !minVersion) {
            return false;
        }

        var vParts = version.split('.').map(function(p) {
            return parseInt(p, 10) || 0;
        });
        var mParts = minVersion.split('.').map(function(p) {
            return parseInt(p, 10) || 0;
        });

        // Pad arrays to same length
        while (vParts.length < 3) vParts.push(0);
        while (mParts.length < 3) mParts.push(0);

        // Compare major.minor.patch
        for (var i = 0; i < 3; i++) {
            if (vParts[i] > mParts[i]) return true;
            if (vParts[i] < mParts[i]) return false;
        }

        return true; // Equal versions
    }

    /**
     * Check if PeopleSoft's native jQuery meets minimum requirements
     * @returns {boolean} True if compatible version exists
     */
    function hasCompatibleJQuery() {
        if (!CONFIG.PREFER_NATIVE) {
            return false;
        }

        if (!_jQuery || typeof _jQuery.fn !== 'object') {
            return false;
        }

        var version = _jQuery.fn.jquery;
        if (!version) {
            return false;
        }

        return isVersionCompatible(version, CONFIG.JQUERY_MIN_VERSION);
    }

    /**
     * Get version info string for logging
     * @returns {string} Version info
     */
    function getVersionInfo() {
        if (_jQuery && _jQuery.fn && _jQuery.fn.jquery) {
            return _jQuery.fn.jquery + ' (native PeopleSoft)';
        }
        return 'not detected';
    }

    /**
     * Setup jQuery in noConflict mode
     */
    function setupNoConflict() {
        if (typeof jQuery !== 'undefined') {
            // Create private reference for A11Y widget
            window.a11yJQ = jQuery.noConflict(true);

            // Restore original jQuery if it existed
            if (_jQuery) {
                window.jQuery = _jQuery;
            }
            if (_$) {
                window.$ = _$;
            }

            return true;
        }
        return false;
    }

    /**
     * Load jQuery from CDN with fallback
     * @param {string} url - CDN URL to load from
     * @param {function} onSuccess - Callback on successful load
     * @param {function} onError - Callback on error
     */
    function loadFromCDN(url, onSuccess, onError) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = true;

        var timeout = setTimeout(function() {
            script.onload = script.onerror = null;
            onError(new Error('jQuery load timeout after ' + CONFIG.LOAD_TIMEOUT + 'ms'));
        }, CONFIG.LOAD_TIMEOUT);

        script.onload = function() {
            clearTimeout(timeout);
            if (setupNoConflict()) {
                onSuccess();
            } else {
                onError(new Error('jQuery loaded but setup failed'));
            }
        };

        script.onerror = function() {
            clearTimeout(timeout);
            onError(new Error('Failed to load jQuery from ' + url));
        };

        document.head.appendChild(script);
    }

    /**
     * Initialize jQuery with fallback chain
     *
     * Priority order:
     * 1. PeopleSoft's native jQuery (if PREFER_NATIVE=true and version compatible)
     * 2. Embedded jQuery (if pasted at placeholder)
     * 3. CDN loading (with fallback)
     */
    function initializeJQuery() {
        // Log current state for debugging
        console.log('[A11Y] jQuery detection: ' + getVersionInfo());
        console.log('[A11Y] Minimum required version: ' + CONFIG.JQUERY_MIN_VERSION);

        // ================================================================
        // OPTION 1: Use PeopleSoft's native jQuery (DEFAULT BEHAVIOR)
        // This is preferred to avoid loading duplicate jQuery instances
        // ================================================================
        if (hasCompatibleJQuery()) {
            // Create a reference to the native jQuery WITHOUT removing it
            // from the global scope. This allows both PeopleSoft and A11Y
            // widget to use the same jQuery instance.
            window.a11yJQ = _jQuery;

            console.log('[A11Y] Using PeopleSoft native jQuery ' + _jQuery.fn.jquery);
            console.log('[A11Y] jQuery remains available globally for PeopleSoft');
            dispatchReadyEvent();
            return;
        }

        // Log why native jQuery wasn't used
        if (!CONFIG.PREFER_NATIVE) {
            console.log('[A11Y] PREFER_NATIVE is disabled, loading separate jQuery');
        } else if (!_jQuery) {
            console.log('[A11Y] No native jQuery detected');
        } else {
            console.log('[A11Y] Native jQuery ' + (_jQuery.fn ? _jQuery.fn.jquery : 'unknown') +
                       ' does not meet minimum version ' + CONFIG.JQUERY_MIN_VERSION);
        }

        // ================================================================
        // OPTION 2: Check if jQuery was embedded below
        // ================================================================
        /* === BEGIN JQUERY EMBED === */
        // PRODUCTION: Paste the contents of jquery-3.7.1.min.js here
        // Download from: https://code.jquery.com/jquery-3.7.1.min.js
        //
        // This is the recommended approach for PeopleSoft deployments
        // when native jQuery is not compatible or PREFER_NATIVE is false.
        /* === END JQUERY EMBED === */

        // Check if jQuery was embedded (would be defined after the placeholder)
        if (typeof jQuery !== 'undefined' && jQuery !== _jQuery && setupNoConflict()) {
            console.log('[A11Y] Using embedded jQuery ' + window.a11yJQ.fn.jquery);
            dispatchReadyEvent();
            return;
        }

        // ================================================================
        // OPTION 3: Load from CDN with fallback
        // ================================================================
        console.log('[A11Y] Loading jQuery ' + CONFIG.JQUERY_CDN_VERSION + ' from CDN...');

        loadFromCDN(CONFIG.JQUERY_CDN_URL,
            function() {
                console.log('[A11Y] jQuery ' + CONFIG.JQUERY_CDN_VERSION + ' loaded from CDN');
                dispatchReadyEvent();
            },
            function(primaryError) {
                console.warn('[A11Y] Primary CDN failed, trying fallback...', primaryError.message);

                loadFromCDN(CONFIG.JQUERY_CDN_FALLBACK,
                    function() {
                        console.log('[A11Y] jQuery ' + CONFIG.JQUERY_CDN_VERSION + ' loaded from fallback CDN');
                        dispatchReadyEvent();
                    },
                    function(fallbackError) {
                        console.error('[A11Y] Failed to load jQuery from all sources.');
                        console.error('[A11Y] Primary error:', primaryError.message);
                        console.error('[A11Y] Fallback error:', fallbackError.message);
                        console.error('[A11Y] Widget will not function.');
                        console.error('[A11Y] Solutions: 1) Embed jQuery in this file, or');
                        console.error('[A11Y]            2) Ensure PeopleSoft jQuery >= ' + CONFIG.JQUERY_MIN_VERSION);
                        dispatchErrorEvent(fallbackError);
                    }
                );
            }
        );
    }

    /**
     * Dispatch ready event when jQuery is available
     */
    function dispatchReadyEvent() {
        // Use try-catch for CustomEvent compatibility
        try {
            var event = new CustomEvent('a11y:jqueryReady', {
                detail: { version: window.a11yJQ.fn.jquery }
            });
            document.dispatchEvent(event);
        } catch (e) {
            // Fallback for older browsers
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('a11y:jqueryReady', true, true, {
                version: window.a11yJQ.fn.jquery
            });
            document.dispatchEvent(evt);
        }
    }

    /**
     * Dispatch error event when jQuery fails to load
     */
    function dispatchErrorEvent(error) {
        try {
            var event = new CustomEvent('a11y:jqueryError', {
                detail: { error: error.message }
            });
            document.dispatchEvent(event);
        } catch (e) {
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent('a11y:jqueryError', true, true, {
                error: error.message
            });
            document.dispatchEvent(evt);
        }
    }

    // Initialize
    initializeJQuery();

})();
