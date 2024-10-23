/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} peopleId 
 * @returns {Promise<person[]>} 
 */
const getPeople = async (database, peopleId = null) => {

    let sql = "SELECT * FROM people";
    const args = [];
    if (peopleId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " person_id IN (?)";
        args.push(peopleId);
    }

    let people;
    try {
        [people] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    return people.map((person) => ({
        id: person.person_id,
        name: person.name,
        balance: person.balance
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} businessesId 
 * @returns {Promise<business[]>} 
 */
const getBusinesses = async (database, businessesId = null) => {

    let sql = "SELECT * FROM businesses";
    const args = [];
    if (businessesId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " business_id IN (?)";
        args.push(businessesId);
    }

    let businesses;
    try {
        [businesses] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    return businesses.map((business) => ({
        id: business.business_id,
        name: business.name
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} accountsId 
 * @returns {Promise<account[]>} 
 */
const getAccounts = async (database, accountsId = null) => {

    let sql = "SELECT * FROM accounts";
    const args = [];
    if (accountsId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " account_id IN (?)";
        args.push(accountsId);
    }

    let accounts;
    try {
        [accounts] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    return accounts.map((account) => ({
        id: account.account_id,
        name: account.name,
        balance: account.balance
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} inflowsId 
 * @param {string[]} includes 
 * @returns {Promise<inflow[]>} 
 */
const getInflows = async (database, inflowsId = null, includes = []) => {

    let sql = "SELECT * FROM inflows";
    const args = [];
    if (inflowsId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " inflow_id IN (?)";
        args.push(inflowsId);
    }

    let inflows;
    try {
        [inflows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const people = includes.includes("person") && inflows.length > 0 ? await getPeople(database, inflows.map((inflow) => inflow.person_id)) : null;
    const accounts = includes.includes("account") && inflows.length > 0 ? await getAccounts(database, inflows.map((inflow) => inflow.account_id)) : null;
    const fromBusinesses = includes.includes("frombusiness") && inflows.length > 0 ? await getBusinesses(database, inflows.filter((inflow) => inflow.from_business_id).map((inflow) => inflow.from_business_id)) : null;

    return inflows.map((inflow) => ({
        id: inflow.inflow_id,
        person: people?.find((person) => person.id === inflow.person_id) ?? inflow.person_id,
        account: accounts?.find((account) => account.id === inflow.account_id) ?? inflow.account_id,
        fromName: inflow.from_name,
        fromBusiness: fromBusinesses?.find((business) => business.id === inflow.from_business_id) ?? inflow.from_business_id,
        amount: inflow.amount,
        description: inflow.description,
        startDate: inflow.start_date,
        endDate: inflow.end_date,
        date: inflow.date
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} outflowsId 
 * @param {string[]} includes 
 * @returns {Promise<outflow[]>} 
 */
const getOutflows = async (database, outflowsId = null, includes = []) => {

    let sql = "SELECT * FROM outflows";
    const args = [];
    if (outflowsId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " outflow_id IN (?)";
        args.push(outflowsId);
    }

    let outflows;
    try {
        [outflows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const people = includes.includes("person") && outflows.length > 0 ? await getPeople(database, outflows.map((outflow) => outflow.person_id)) : null;
    const accounts = includes.includes("account") && outflows.length > 0 ? await getAccounts(database, outflows.map((outflow) => outflow.account_id)) : null;
    const toBusinesses = includes.includes("tobusiness") && outflows.length > 0 ? await getBusinesses(database, outflows.map((outflow) => outflow.to_business_id)) : null;

    return outflows.map((outflow) => ({
        id: outflow.outflow_id,
        person: people?.find((person) => person.id === outflow.person_id) ?? outflow.person_id,
        account: accounts?.find((account) => account.id === outflow.account_id) ?? outflow.account_id,
        toBusiness: toBusinesses?.find((business) => business.id === outflow.to_business_id) ?? outflow.to_business_id,
        amount: outflow.amount,
        description: outflow.description,
        startDate: outflow.start_date,
        endDate: outflow.end_date,
        date: outflow.date
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} flowsId 
 * @param {string[]} includes 
 * @returns {Promise<flow[]>} 
 */
const getFlows = async (database, flowsId = null, includes = []) => {

    let sql = "SELECT * FROM flows";
    const args = [];
    if (flowsId) {
        sql += (sql.includes("WHERE") ? " &&" : " WHERE") + " flow_id IN (?)";
        args.push(flowsId);
    }

    let flows;
    try {
        [flows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const inflows = includes.includes("inflow") && flows.length > 0 ? await getInflows(database, flows.filter((flow) => flow.inflow_id).map((flow) => flow.inflow_id), subIncludes(includes, "inflow")) : null;
    const fromAccounts = includes.includes("fromaccount") && flows.length > 0 ? await getAccounts(database, flows.filter((flow) => flow.from_account_id).map((flow) => flow.from_account_id)) : null;
    const outflows = includes.includes("outflow") && flows.length > 0 ? await getOutflows(database, flows.filter((flow) => flow.outflow_id).map((flow) => flow.outflow_id), subIncludes(includes, "outflow")) : null;
    const toAccounts = includes.includes("toaccount") && flows.length > 0 ? await getAccounts(database, flows.filter((flow) => flow.to_account_id).map((flow) => flow.to_account_id)) : null;

    return flows.map((flow) => ({
        id: flow.flow_id,
        inflow: inflows?.find((inflow) => inflow.id === flow.inflow_id) ?? flow.inflow_id,
        fromAccount: fromAccounts?.find((fromAccount) => fromAccount.id === flow.from_account_id) ?? flow.from_account_id,
        outflow: outflows?.find((outflow) => outflow.id === flow.outflow_id) ?? flow.outflow_id,
        toAccount: toAccounts?.find((toAccount) => toAccount.id === flow.to_account_id) ?? flow.to_account_id,
        amount: flow.amount,
        date: flow.date
    }));
};

const subIncludes = (includes, name) => includes.filter((include) => include.startsWith(name + ".")).map((include) => include.replace(name + ".", ""));

module.exports = {
    getPeople,
    getBusinesses,
    getAccounts,
    getInflows,
    getOutflows,
    getFlows
};

/**
 * @typedef {{
 *     id: number,
 *     name: string,
 *     balance: number
 * }} person 
 * 
 * @typedef {{
 *     id: number,
 *     name: string
 * }} business 
 * 
 * @typedef {{
 *     id: number,
 *     name: string,
 *     balance: number
 * }} account 
 * 
 * @typedef {{
 *     id: number,
 *     person: person|number,
 *     account: account|number,
 *     fromName: string|null,
 *     fromBusiness: business|number|null,
 *     amount: number,
 *     description: string|null,
 *     startDate: number|null,
 *     endDate: number|null,
 *     date: number
 * }} inflow 
 * 
 * @typedef {{
 *     id: number,
 *     person: number|number,
 *     account: account|number,
 *     toBusiness: business|number,
 *     amount: number,
 *     description: string|null,
 *     startDate: number|null,
 *     endDate: number|null,
 *     date: number
 * }} outflow 
 * 
 * @typedef {{
 *     id: number,
 *     inflow: inflow|number|null,
 *     fromAccount: account|number|null,
 *     outflow: outflow|number|null,
 *     toAccount: account|number|null,
 *     amount: number,
 *     date: number
 * }} flow 
 */
