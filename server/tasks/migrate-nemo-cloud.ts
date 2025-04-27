import { migrateNemoCloud } from "~/server/nemo-cloud/migration";

export default defineTask({
  meta: {
    name: "migrate-nemo-cloud",
    description: "Migrate data from NemoCloud servers",
  },
  async run() {
    await Promise.all([migrateNemoCloud("s5"), migrateNemoCloud("cloud")]);
    return { result: "Success" };
  },
});
