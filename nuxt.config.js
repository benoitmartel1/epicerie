export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "epicerie",
    htmlAttrs: {
      lang: "en"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
        href:
          "https://fonts.googleapis.com/css2?family=Nunito:wght@700&display=swap",
        rel: "stylesheet"
      },
      {
        href:
          "https://fonts.googleapis.com/css2?family=Balsamiq+Sans&display=swap",
        rel: "stylesheet"
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["element-ui/lib/theme-chalk/index.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["@/plugins/element-ui", "@/plugins/supabase"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,
  env: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000"
  },
  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: ["@nuxtjs/dotenv"],
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/]
  },
  router: {
    base: "/epicerie/"
  }
};
