import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export { routing };

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Use explicit imports for each locale to ensure compatibility with Edge Runtime
    let messages;
    if (locale === 'ko') {
        messages = (await import('../messages/ko.json')).default;
    } else {
        messages = (await import('../messages/en.json')).default;
    }

    return {
        locale,
        messages
    };
});
