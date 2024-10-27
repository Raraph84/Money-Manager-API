const { getConfig, TaskManager } = require("raraph84-lib");
const { getPeople, getAccounts, getInflows, getOutflows, getFlows } = require("./src/resources");
const myqsl = require("mysql2/promise");
const config = getConfig(__dirname);

require("dotenv").config({ path: [".env.local", ".env"] });

const tasks = new TaskManager();

const database = myqsl.createPool({ password: process.env.DATABASE_PASSWORD, charset: "utf8mb4_general_ci", ...config.database });
tasks.addTask((resolve, reject) => {
    console.log("Connecting to the database...");
    database.query("SELECT 1").then(() => {
        console.log("Connected to the database.");
        resolve();
    }).catch((error) => {
        console.log("Cannot connect to the database - " + error);
        reject();
    });
}, (resolve) => database.end().then(() => resolve()));

tasks.addTask(async (resolve, reject) => {

    const people = await getPeople(database);
    const accounts = await getAccounts(database);
    const inflows = await getInflows(database);
    const outflows = await getOutflows(database);
    const flows = await getFlows(database);

    for (const person of people) {

        let balance = 0;

        for (const inflow of inflows.filter((inflow) => inflow.person === person.id))
            balance += inflow.amount;

        for (const outflow of outflows.filter((outflow) => outflow.person === person.id))
            balance -= outflow.amount;

        balance = Math.round(balance * 100) / 100;

        if (person.balance === balance) {
            console.log(`Person ${person.name} (${person.id}) balance is correct. (${balance} €)`);
        } else {
            console.log(`Person ${person.name} (${person.id}) balance is incorrect. (${person.balance} € should be ${balance} €)`);
        }
    }

    for (const account of accounts) {

        let balance = 0;

        for (const inflow of inflows.filter((inflow) => inflow.account === account.id))
            balance += inflow.amount;

        for (const outflow of outflows.filter((outflow) => outflow.account === account.id))
            balance -= outflow.amount;

        for (const flow of flows.filter((flow) => flow.fromAccount === account.id))
            balance -= flow.amount;

        for (const flow of flows.filter((flow) => flow.toAccount === account.id))
            balance += flow.amount;

        balance = Math.round(balance * 100) / 100;

        if (account.balance === balance) {
            console.log(`Account ${account.name} (${account.id}) balance is correct. (${balance} €)`);
        } else {
            console.log(`Account ${account.name} (${account.id}) balance is incorrect. (${account.balance} € should be ${balance} €)`);
        }
    }

    database.end();
    resolve();

}, (resolve) => resolve());

tasks.run();
