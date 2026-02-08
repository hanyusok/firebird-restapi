import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'ko'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Prefix strategy - always show locale in URL for consistency
    localePrefix: 'always'
});
