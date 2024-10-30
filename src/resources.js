/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} peopleId 
 * @returns {Promise<person[]>} 
 */
const getPeople = async (database, peopleId = null) => {

    let sql = "SELECT * FROM people";
    const args = [];
    if (peopleId) {
        sql += " WHERE person_id IN (?)";
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
        sql += " WHERE business_id IN (?)";
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
        sql += " WHERE account_id IN (?)";
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
 * @param {number[]|null} peopleFilter 
 * @param {string[]} includes 
 * @returns {Promise<inflow[]>} 
 */
const getInflows = async (database, inflowsId = null, peopleFilter = null, includes = []) => {

    let sql = "SELECT * FROM inflows";
    const args = [];
    if (inflowsId) {
        sql += " WHERE inflow_id IN (?)";
        args.push(inflowsId);
    } else if (peopleFilter) {
        sql += " WHERE person_id IN (?)";
        args.push(peopleFilter);
    }
    sql += " ORDER BY date DESC";

    let inflows;
    try {
        [inflows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const people = includes.includes("person") && inflows.length > 0 ? await getPeople(database, inflows.map((inflow) => inflow.person_id)) : null;
    const fromBusinesses = includes.includes("frombusiness") && inflows.filter((inflow) => inflow.from_business_id).length > 0 ? await getBusinesses(database, inflows.filter((inflow) => inflow.from_business_id).map((inflow) => inflow.from_business_id)) : null;

    return inflows.map((inflow) => ({
        id: inflow.inflow_id,
        person: people?.find((person) => person.id === inflow.person_id) ?? inflow.person_id,
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
 * @param {number[]|null} peopleFilter 
 * @param {string[]} includes 
 * @returns {Promise<outflow[]>} 
 */
const getOutflows = async (database, outflowsId = null, peopleFilter = null, includes = []) => {

    let sql = "SELECT * FROM outflows";
    const args = [];
    if (outflowsId) {
        sql += " WHERE outflow_id IN (?)";
        args.push(outflowsId);
    } else if (peopleFilter) {
        sql += " WHERE person_id IN (?)";
        args.push(peopleFilter);
    }
    sql += " ORDER BY date DESC";

    let outflows;
    try {
        [outflows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const people = includes.includes("person") && outflows.length > 0 ? await getPeople(database, outflows.map((outflow) => outflow.person_id)) : null;
    const toBusinesses = includes.includes("tobusiness") && outflows.filter((outflow) => outflow.to_business_id).length > 0 ? await getBusinesses(database, outflows.filter((outflow) => outflow.to_business_id).map((outflow) => outflow.to_business_id)) : null;

    return outflows.map((outflow) => ({
        id: outflow.outflow_id,
        person: people?.find((person) => person.id === outflow.person_id) ?? outflow.person_id,
        toName: outflow.to_name,
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
 * @param {number[]|null} accountsFilter 
 * @param {string[]} includes 
 * @returns {Promise<flow[]>} 
 */
const getFlows = async (database, flowsId = null, accountsFilter = null, includes = []) => {

    let sql = "SELECT * FROM flows";
    const args = [];
    if (flowsId) {
        sql += " WHERE flow_id IN (?)";
        args.push(flowsId);
    } else if (accountsFilter) {
        sql += " WHERE from_account_id IN (?) || to_account_id IN (?)";
        args.push(accountsFilter, accountsFilter);
    }
    sql += " ORDER BY date DESC";

    let flows;
    try {
        [flows] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const fromAccounts = includes.includes("fromaccount") && flows.filter((flow) => flow.from_account_id).length > 0 ? await getAccounts(database, flows.filter((flow) => flow.from_account_id).map((flow) => flow.from_account_id)) : null;
    const toAccounts = includes.includes("toaccount") && flows.filter((flow) => flow.to_account_id).length > 0 ? await getAccounts(database, flows.filter((flow) => flow.to_account_id).map((flow) => flow.to_account_id)) : null;

    return flows.map((flow) => ({
        id: flow.flow_id,
        fromAccount: fromAccounts?.find((fromAccount) => fromAccount.id === flow.from_account_id) ?? flow.from_account_id,
        toAccount: toAccounts?.find((toAccount) => toAccount.id === flow.to_account_id) ?? flow.to_account_id,
        amount: flow.amount,
        date: flow.date
    }));
};

/**
 * @param {import("mysql2/promise").Pool} database 
 * @param {number[]|null} flowsLinkId 
 * @param {number[]|null} flowsFilter 
 * @param {number[]|null} inflowsFilter 
 * @param {number[]|null} outflowsFilter 
 * @param {string[]} includes 
 * @returns {Promise<flows_link[]>} 
 */
const getFlowsLinks = async (database, flowsLinkId = null, flowsFilter = null, inflowsFilter = null, outflowsFilter = null, includes = []) => {

    let sql = "SELECT * FROM flows_links";
    const args = [];
    if (flowsLinkId) {
        sql += " WHERE flow_link_id IN (?)";
        args.push(flowsLinkId);
    } else if (flowsFilter) {
        sql += " WHERE flow_id IN (?)";
        args.push(flowsFilter);
    } else if (inflowsFilter) {
        sql += " WHERE inflow_id IN (?)";
        args.push(inflowsFilter);
    } else if (outflowsFilter) {
        sql += " WHERE outflow_id IN (?)";
        args.push(outflowsFilter);
    }

    let flowsLinks;
    try {
        [flowsLinks] = await database.query(sql, args);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error("Database error");
    }

    const flows = includes.includes("flow") && flowsLinks.length > 0 ? await getFlows(database, flowsLinks.map((flowsLink) => flowsLink.flow_id), subIncludes(includes, "flow")) : null;
    const filteredInflows = flowsLinks.filter((flowsLink) => flowsLink.inflow_id);
    const inflows = includes.includes("inflow") && filteredInflows.length > 0 ? await getInflows(database, filteredInflows.map((flowsLink) => flowsLink.inflow_id), null, subIncludes(includes, "inflow")) : null;
    const filteredOutflows = flowsLinks.filter((flowsLink) => flowsLink.outflow_id);
    const outflows = includes.includes("outflow") && filteredOutflows.length > 0 ? await getOutflows(database, filteredOutflows.map((flowsLink) => flowsLink.outflow_id), null, subIncludes(includes, "outflow")) : null;

    return flowsLinks.map((flowsLink) => ({
        id: flowsLink.flow_link_id,
        flow: flows?.find((flow) => flow.id === flowsLink.flow_id) ?? flowsLink.flow_id,
        inflow: inflows?.find((inflow) => inflow.id === flowsLink.inflow_id) ?? flowsLink.inflow_id,
        outflow: outflows?.find((outflow) => outflow.id === flowsLink.outflow_id) ?? flowsLink.outflow_id,
        amount: flowsLink.amount
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
 *     toName: string|null,
 *     toBusiness: business|number|null,
 *     amount: number,
 *     description: string|null,
 *     startDate: number|null,
 *     endDate: number|null,
 *     date: number
 * }} outflow 
 * 
 * @typedef {{
 *     id: number,
 *     fromAccount: account|number|null,
 *     toAccount: account|number|null,
 *     amount: number,
 *     date: number
 * }} flow 
 * 
 * @typedef {{
 *     id: number,
 *     flow_id: number,
 *     inflow_id: number|null,
 *     outflow_id: number|null,
 *     amount: number
 * }} flows_link 
 */
