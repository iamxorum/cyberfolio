import { Font } from '@react-pdf/renderer';

// react-pdf breaks long words with a hyphen by default ("Foun-dations", "manag-ing"). Keep every word whole.
Font.registerHyphenationCallback((word) => [word]);
