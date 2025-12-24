const { getConfig, TaskManager } = require("raraph84-lib");
const { getInflows, getOutflows, getFlows, getFlowsLinks } = require("./src/resources");
const myqsl = require("mysql2/promise");
const config = getConfig(__dirname);

require("dotenv").config({ path: [".env.local", ".env"] });

const tasks = new TaskManager();

const database = myqsl.createPool({
    password: process.env.DATABASE_PASSWORD,
    charset: "utf8mb4_general_ci",
    ...config.database
});
tasks.addTask(
    (resolve, reject) => {
        console.log("Connecting to the database...");
        database
            .query("SELECT 1")
            .then(() => {
                console.log("Connected to the database.");
                resolve();
            })
            .catch((error) => {
                console.log("Cannot connect to the database - " + error);
                reject();
            });
    },
    (resolve) => database.end().then(() => resolve())
);

tasks.addTask(
    async (resolve) => {
        const flows = await getFlows(database);
        const flowsLinks = await getFlowsLinks(database);
        const inflows = await getInflows(database);
        const outflows = await getOutflows(database);

        for (const flowsLink of flowsLinks) {
            if (!flowsLink.inflow && !flowsLink.outflow)
                console.log(`Flows link ${flowsLink.id} has not inflow or outflow.`);

            if (flowsLink.inflow && flowsLink.outflow)
                console.log(`Flows link ${flowsLink.id} has both inflow and outflow.`);

            const flow = flows.find((flow) => flow.id === flowsLink.flow);
            const inflow = inflows.find((inflow) => inflow.id === flowsLink.inflow);
            const outflow = outflows.find((outflow) => outflow.id === flowsLink.outflow);

            if (!flow) console.log(`Flow of flows link ${flowsLink.id} does not exist.`);

            if (flowsLink.inflow && !inflow) console.log(`Inflow of flows link ${flowsLink.id} does not exist.`);

            if (flowsLink.outflow && !outflow) console.log(`Outflow of flows link ${flowsLink.id} does not exist.`);
        }

        for (const flow of flows) {
            if (!flow.fromAccount && !flow.toAccount) {
                console.log(`Flow ${flow.id} has not from account or to account.`);
                continue;
            }

            const flowFlowsLinks = flowsLinks.filter((flowsLink) => flowsLink.flow === flow.id);

            if (flow.fromAccount && flow.toAccount) {
                if (flowFlowsLinks.length > 0)
                    console.log(`Flow ${flow.id} has both from account and to account and has links.`);

                continue;
            }

            if (flow.fromAccount && flowFlowsLinks.some((flowsLink) => flowsLink.inflow)) {
                console.log(`Flow ${flow.id} has from account and has inflow links.`);
                continue;
            }

            if (flow.toAccount && flowFlowsLinks.some((flowsLink) => flowsLink.outflow)) {
                console.log(`Flow ${flow.id} has to account and has outflow links.`);
                continue;
            }

            let total = 0;
            for (const flowsLink of flowFlowsLinks) total += flowsLink.amount;
            total = Math.round(total * 100) / 100;

            if (total !== flow.amount)
                console.log(`Total amount of flow ${flow.id} is incorrect (inflow: ${flow.amount}, links: ${total}).`);
        }

        for (const inflow of inflows) {
            if (!inflow.fromName && !inflow.fromBusiness)
                console.log(`Inflow ${inflow.id} has not from name or from business.`);

            if (inflow.fromName && inflow.fromBusiness)
                console.log(`Inflow ${inflow.id} has both from name and from business.`);

            const inflowFlowsLinks = flowsLinks.filter((flowsLink) => flowsLink.inflow === inflow.id);

            let total = 0;
            for (const flowsLink of inflowFlowsLinks) total += flowsLink.amount;
            total = Math.round(total * 100) / 100;

            if (total !== inflow.amount)
                console.log(
                    `Total amount of inflow ${inflow.id} is incorrect (inflow: ${inflow.amount}, links: ${total}).`
                );
        }

        for (const outflow of outflows) {
            if (!outflow.toName && !outflow.toBusiness)
                console.log(`Outflow ${outflow.id} has not to name or to business.`);

            if (outflow.toName && outflow.toBusiness)
                console.log(`Outflow ${outflow.id} has both to name and to business.`);

            const outflowFlowsLinks = flowsLinks.filter((flowsLink) => flowsLink.outflow === outflow.id);

            let total = 0;
            for (const flowsLink of outflowFlowsLinks) total += flowsLink.amount;
            total = Math.round(total * 100) / 100;

            if (total !== outflow.amount)
                console.log(
                    `Total amount of outflow ${outflow.id} is incorrect (inflow: ${outflow.amount}, links: ${total}).`
                );
        }

        database.end();
        resolve();

        console.log("Finished.");
    },
    (resolve) => resolve()
);

tasks.run();
