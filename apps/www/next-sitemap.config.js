/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://jsoncrack.com",
  exclude: ["/widget"],
  autoLastmod: false,
  changefreq: "never",
};
