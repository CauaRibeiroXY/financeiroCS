/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pluggy.ai',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    // Front e API vivem na mesma origem, então CORS não é necessário para o
    // funcionamento do app. A configuração anterior era `Allow-Origin: *` junto
    // de `Allow-Credentials: true` — combinação que os navegadores rejeitam, e
    // que ainda por cima anunciava a API como chamável de qualquer site.
    //
    // Aqui a origem é restrita ao próprio domínio. Sem NEXT_PUBLIC_APP_URL
    // definida (desenvolvimento), nenhum header de CORS é emitido: mesma origem
    // dispensa.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) return [];

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: appUrl },
          { key: 'Vary', value: 'Origin' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
