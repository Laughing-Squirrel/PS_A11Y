/**
 * A11Y_JQUERY_NOCONFLICT_JS
 * PeopleSoft Accessibility Widget - jQuery NoConflict Wrapper
 *
 * This module loads jQuery in noConflict mode to prevent conflicts with
 * PeopleSoft's internal jQuery usage. The accessibility widget's jQuery
 * is accessible via window.a11yJQ.
 *
 * @version 1.0.0
 * @license MIT
 */
(function() {
    'use strict';

    // Store existing jQuery references if present
    var _jQuery = window.jQuery;
    var _$ = window.$;

    // Check if we need to load jQuery or if a compatible version exists
    var needsJQuery = true;

    if (_jQuery && typeof _jQuery.fn === 'object') {
        var version = _jQuery.fn.jquery;
        var parts = version.split('.');
        var major = parseInt(parts[0], 10);
        var minor = parseInt(parts[1], 10);

        // If jQuery 3.x or higher exists, we can use it
        if (major >= 3) {
            window.a11yJQ = _jQuery.noConflict(true);

            // Restore original references
            if (_jQuery) window.jQuery = _jQuery;
            if (_$) window.$ = _$;

            needsJQuery = false;
            console.log('[A11Y] Using existing jQuery ' + version);
        }
    }

    if (needsJQuery) {
        // jQuery 3.7.1 will be loaded here
        // In production, include the full minified jQuery source below this comment
        // For PeopleSoft deployment, paste the contents of jquery-3.7.1.min.js here

        /* === BEGIN JQUERY PLACEHOLDER === */
        // IMPORTANT: Replace this section with the full jQuery 3.7.1 minified source
        // Download from: https://code.jquery.com/jquery-3.7.1.min.js

        if (typeof jQuery === 'undefined') {
            console.error('[A11Y] jQuery source must be included in this file. ' +
                'Please download jQuery 3.7.1 and paste the minified source here.');
        }
        /* === END JQUERY PLACEHOLDER === */

        // After jQuery is loaded, set up noConflict
        if (typeof jQuery !== 'undefined') {
            // Create private reference for A11Y widget
            window.a11yJQ = jQuery.noConflict(true);

            // Restore original jQuery if it existed
            if (_jQuery) window.jQuery = _jQuery;
            if (_$) window.$ = _$;

            console.log('[A11Y] jQuery loaded in noConflict mode as window.a11yJQ');
        }
    }

    // Verify a11yJQ is available
    if (typeof window.a11yJQ === 'undefined') {
        console.error('[A11Y] Failed to initialize jQuery. Widget may not function correctly.');
    }

})();
