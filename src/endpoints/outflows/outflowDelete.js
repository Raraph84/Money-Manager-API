const { getOutflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    let outflow;
    try {
        outflow = (await getOutflows(database, [request.urlParams.outflowId], null, ["links"]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!outflow) {
        request.end(400, "This outflow does not exist");
        return;
    }

    try {
        if (outflow.links.length) await database.query("DELETE FROM flows_links WHERE outflow_id=?", [outflow.id]);
        await database.query("DELETE FROM outflows WHERE outflow_id=?", [outflow.id]);
        await database.query("UPDATE people SET balance=ROUND(balance-?, 2) WHERE person_id=?", [outflow.amount, outflow.person]);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    request.end(204);
}

module.exports.infos = {
    path: "/outflows/:outflowId",
    method: "DELETE",
    requiresAuth: true
}
