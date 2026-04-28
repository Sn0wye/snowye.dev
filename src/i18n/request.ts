import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { messages } from './messages';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // We expose our typed bundle as next-intl messages so useTranslations
    // works alongside our direct `messages[locale]` access.
    messages: messages[locale] as unknown as Record<string, unknown>
  };
});
