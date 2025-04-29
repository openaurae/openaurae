// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      // migrate NemoCloud data every 2 hours
      "0 */2 * * *": ["migrate-nemo-cloud"],
    },
  },
  runtimeConfig: {
    db: {
      host: process.env.NUXT_DB_HOST || "localhost",
      port: process.env.NUXT_DB_PORT || "5432",
      database: process.env.NUXT_DB_DATABASE || "openaurae",
      user: process.env.NUXT_DB_USER || "openaurae",
      password: process.env.NUXT_DB_PASSWORD,
    },
    mqtt: {
      protocol: process.env.NUXT_MQTT_PROTOCOL || "mqtt",
      host: process.env.NUXT_MQTT_HOST || "localhost",
      port: process.env.NUXT_MQTT_PORT || "1883",
    },
    nemo: {
      cloud: {
        url: process.env.NUXT_NEMO_CLOUD_URL || "https://www.nemocloud.com",
        operator: process.env.NUXT_NEMO_CLOUD_OPERATOR,
        password: process.env.NUXT_NEMO_CLOUD_PASSWORD,
        company: process.env.NUXT_NEMO_CLOUD_COMPANY,
      },
      s5: {
        url: process.env.NUXT_NEMO_S5_URL || "https://s5.nemocloud.com",
        operator: process.env.NUXT_NEMO_S5_OPERATOR,
        password: process.env.NUXT_NEMO_S5_PASSWORD,
        company: process.env.NUXT_NEMO_S5_COMPANY,
      },
    },
  },
});
