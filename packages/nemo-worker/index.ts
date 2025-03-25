import {migrate, type NemoCloudAccount, NemoCloudAccountSchema} from "@openaurae/nemo";

const account = NemoCloudAccountSchema.parse({
    serverUrl: Bun.env.NEMO_URL,
    operator: Bun.env.NEMO_OPERATOR,
    password: Bun.env.NEMO_PASSWORD,
    company: Bun.env.NEMO_COMPANY,
})

const s5Account = NemoCloudAccountSchema.parse({
    serverUrl: Bun.env.NEMO_S5_URL,
    operator: Bun.env.NEMO_S5_OPERATOR,
    password: Bun.env.NEMO_S5_PASSWORD,
    company: Bun.env.NEMO_S5_COMPANY,
})

await Promise.all([
    migrateForever(account),
    migrateForever(s5Account),
]);

async function migrateForever(account: NemoCloudAccount) {
    while (true) {
        try {
            await migrate(account);
        } catch (e) {
            console.error(e);
        } finally {
            await Bun.sleep(3600_000); // 10 min
        }
    }
}
