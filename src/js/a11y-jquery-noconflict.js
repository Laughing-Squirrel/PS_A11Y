/**
 * A11Y_JQUERY_NOCONFLICT_JS
 * PeopleSoft Accessibility Widget - jQuery NoConflict Wrapper
 *
 * This module loads jQuery in noConflict mode to prevent conflicts with
 * PeopleSoft's internal jQuery usage. The accessibility widget's jQuery
 * is accessible via window.a11yJQ.
 *
 * INSTALLATION OPTIONS:
 * 1. Embed jQuery: Paste jQuery 3.7.1 minified source at the placeholder below
 * 2. CDN Fallback: If jQuery is not embedded, will attempt to load from CDN
 * 3. Use Existing: Will use PeopleSoft's jQuery if version 3.x+
 *
 * @version 1.0.1
 * @license MIT
 */
(function() {
    'use strict';

    // Configuration
    var JQUERY_VERSION = '3.7.1';
    var JQUERY_CDN_URL = 'https://code.jquery.com/jquery-' + JQUERY_VERSION + '.min.js';
    var JQUERY_CDN_FALLBACK = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/' + JQUERY_VERSION + '/jquery.min.js';
    var LOAD_TIMEOUT = 10000; // 10 seconds

    // Store existing jQuery references if present
    var _jQuery = window.jQuery;
    var _$ = window.$;

    /**
     * Check if existing jQuery version is compatible (3.x+)
     * @returns {boolean} True if compatible version exists
     */
    function hasCompatibleJQuery() {
        if (!_jQuery || typeof _jQuery.fn !== 'object') {
            return false;
        }

        var version = _jQuery.fn.jquery;
        if (!version) {
            return false;
        }

        var parts = version.split('.');
        var major = parseInt(parts[0], 10);

        return major >= 3;
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
            onError(new Error('jQuery load timeout'));
        }, LOAD_TIMEOUT);

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
     */
    function initializeJQuery() {
        // Option 1: Use existing compatible jQuery
        if (hasCompatibleJQuery()) {
            window.a11yJQ = _jQuery.noConflict(true);

            // Restore original references
            if (_jQuery) {
                window.jQuery = _jQuery;
            }
            if (_$) {
                window.$ = _$;
            }

            console.log('[A11Y] Using existing jQuery ' + _jQuery.fn.jquery);
            dispatchReadyEvent();
            return;
        }

        // Option 2: Check if jQuery was embedded below
        /* === BEGIN JQUERY EMBED === */
        // PRODUCTION: Paste the contents of jquery-3.7.1.min.js here
        // Download from: https://code.jquery.com/jquery-3.7.1.min.js
        //
        // This is the recommended approach for PeopleSoft deployments
        // as it avoids external CDN dependencies.
        /* === END JQUERY EMBED === */

        // Check if jQuery was embedded
        if (typeof jQuery !== 'undefined' && setupNoConflict()) {
            console.log('[A11Y] Using embedded jQuery');
            dispatchReadyEvent();
            return;
        }

        // Option 3: Load from CDN with fallback
        console.log('[A11Y] Loading jQuery from CDN...');

        loadFromCDN(JQUERY_CDN_URL,
            function() {
                console.log('[A11Y] jQuery ' + JQUERY_VERSION + ' loaded from CDN');
                dispatchReadyEvent();
            },
            function(primaryError) {
                console.warn('[A11Y] Primary CDN failed, trying fallback...', primaryError.message);

                loadFromCDN(JQUERY_CDN_FALLBACK,
                    function() {
                        console.log('[A11Y] jQuery ' + JQUERY_VERSION + ' loaded from fallback CDN');
                        dispatchReadyEvent();
                    },
                    function(fallbackError) {
                        console.error('[A11Y] Failed to load jQuery from all sources.');
                        console.error('[A11Y] Primary error:', primaryError.message);
                        console.error('[A11Y] Fallback error:', fallbackError.message);
                        console.error('[A11Y] Widget will not function. Please embed jQuery in this file.');
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
