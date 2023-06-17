const { JWT_PROTOCOL_SECURE, DOMAIN, JWT_HTTP_ONLY } = process.env;

interface cookieOptions {
  secure: boolean;
  domain: string;
  httpOnly: boolean;
}

export const cookieConfig: cookieOptions = {
  secure: JWT_PROTOCOL_SECURE === 'true',
  domain: DOMAIN,
  httpOnly: JWT_HTTP_ONLY === 'true',
};
