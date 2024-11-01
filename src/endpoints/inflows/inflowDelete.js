const { getInflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    let inflow;
    try {
        inflow = (await getInflows(database, [request.urlParams.inflowId], null, ["links"]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!inflow) {
        request.end(400, "This inflow does not exist");
        return;
    }

    try {
        if (inflow.links.length) await database.query("DELETE FROM flows_links WHERE inflow_id=?", [inflow.id]);
        await database.query("DELETE FROM inflows WHERE inflow_id=?", [inflow.id]);
        await database.query("UPDATE people SET balance=ROUND(balance-?, 2) WHERE person_id=?", [inflow.amount, inflow.person]);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    request.end(204);
}

module.exports.infos = {
    path: "/inflows/:inflowId",
    method: "DELETE",
    requiresAuth: true
}
