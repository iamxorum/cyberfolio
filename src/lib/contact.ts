import 'server-only';

/** Contact details live in the environment so they never ship in client code or static HTML. */
export const contactEmail = (): string | null => process.env.CONTACT_EMAIL?.trim() || null;
export const contactPhone = (): string | null => process.env.CONTACT_PHONE?.trim() || null;
