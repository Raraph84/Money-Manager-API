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
        name: person.name
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
    const fromBusinesses = includes.includes("frombusiness") && inflows.length > 0 ? await getBusinesses(database, inflows.filter((inflow) => inflow.from_business_id).map((inflow) => inflow.from_business_id)) : null;

    return inflows.map((inflow) => ({
        id: inflow.inflow_id,
        person: people?.find((person) => person.id === inflow.person_id) ?? inflow.person_id,
        fromName: inflow.from_name,
        fromBusiness: fromBusinesses?.find((business) => business.id === inflow.from_business_id) ?? inflow.from_business_id,
        amount: inflow.amount,
        description: inflow.description,
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
    const toBusinesses = includes.includes("tobusiness") && outflows.length > 0 ? await getBusinesses(database, outflows.map((outflow) => outflow.to_business_id)) : null;

    return outflows.map((outflow) => ({
        id: outflow.outflow_id,
        person: people?.find((person) => person.id === outflow.person_id) ?? outflow.person_id,
        toBusiness: toBusinesses?.find((business) => business.id === outflow.to_business_id) ?? outflow.to_business_id,
        amount: outflow.amount,
        description: outflow.description,
        date: outflow.date
    }));
};

module.exports = {
    getPeople,
    getBusinesses,
    getInflows,
    getOutflows
};

/**
 * @typedef {{
 *     id: number,
 *     name: string
 * }} person 
 * 
 * @typedef {{
 *     id: number,
 *     name: string
 * }} business 
 * 
 * @typedef {{
 *     id: number,
 *     person: number,
 *     fromName: string|null,
 *     fromBusiness: number|null,
 *     amount: number,
 *     description: string|null,
 *     date: number
 * }} inflow 
 * 
 * @typedef {{
 *     id: number,
 *     person: number,
 *     toBusiness: number,
 *     amount: number,
 *     description: string|null,
 *     date: number
 * }} outflow 
 */
