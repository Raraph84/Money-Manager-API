const { getFlows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    let flow;
    try {
        flow = (await getFlows(database, [request.urlParams.flowId], null, ["links"]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!flow) {
        request.end(400, "This flow does not exist");
        return;
    }

    try {
        if (flow.links.length) await database.query("DELETE FROM flows_links WHERE flow_id=?", [flow.id]);
        await database.query("DELETE FROM flows WHERE flow_id=?", [flow.id]);
        if (flow.fromAccount)
            await database.query("UPDATE accounts SET balance=ROUND(balance+?, 2) WHERE account_id=?", [
                flow.amount,
                flow.fromAccount
            ]);
        if (flow.toAccount)
            await database.query("UPDATE accounts SET balance=ROUND(balance-?, 2) WHERE account_id=?", [
                flow.amount,
                flow.toAccount
            ]);
    } catch (error) {
        console.log(`SQL Error - ${__filename} - ${error}`);
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, flow);
};

module.exports.infos = {
    path: "/flows/:flowId",
    method: "DELETE",
    requiresAuth: true
};
