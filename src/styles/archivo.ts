import { Archivo } from 'next/font/google';

/**
 * CloudCertify's typeface, for its moments on /craft: one family with width
 * as a second axis, so questions run condensed and results expanded. Its own
 * module, so only the routes that show CloudCertify load it.
 */
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap'
});
