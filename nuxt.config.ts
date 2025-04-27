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
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    mqtt: {
      protocol: process.env.MQTT_PROTOCOL,
      host: process.env.MQTT_HOST,
      port: process.env.MQTT_PORT,
    },
    nemo: {
      cloud: {
        url: process.env.NEMO_CLOUD_URL,
        operator: process.env.NEMO_CLOUD_OPERATOR,
        password: process.env.NEMO_CLOUD_PASSWORD,
        company: process.env.NEMO_CLOUD_COMPANY,
      },
      s5: {
        url: process.env.NEMO_S5_URL,
        operator: process.env.NEMO_S5_OPERATOR,
        password: process.env.NEMO_S5_PASSWORD,
        company: process.env.NEMO_S5_COMPANY,
      },
    },
  },
});
