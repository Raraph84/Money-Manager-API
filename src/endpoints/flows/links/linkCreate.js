const { getFlows, getInflows, getOutflows } = require("../../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    if (!request.jsonBody) {
        request.end(400, "Invalid JSON");
        return;
    }

    if (typeof request.jsonBody.inflow === "undefined") {
        request.end(400, "Missing inflow");
        return;
    }

    if (typeof request.jsonBody.inflow !== "number" && request.jsonBody.inflow !== null) {
        request.end(400, "Inflow must be a number or null");
        return;
    }

    if (typeof request.jsonBody.outflow === "undefined") {
        request.end(400, "Missing outflow");
        return;
    }

    if (typeof request.jsonBody.outflow !== "number" && request.jsonBody.outflow !== null) {
        request.end(400, "Outflow must be a number or null");
        return;
    }

    if (request.jsonBody.inflow === null && request.jsonBody.outflow === null) {
        request.end(400, "Inflow and outflow cannot be both null");
        return;
    }

    if (request.jsonBody.inflow !== null && request.jsonBody.outflow !== null) {
        request.end(400, "Inflow and outflow cannot be both set");
        return;
    }

    if (typeof request.jsonBody.amount === "undefined") {
        request.end(400, "Missing amount");
        return;
    }

    if (typeof request.jsonBody.amount !== "number") {
        request.end(400, "Amount must be a number");
        return;
    }

    let flow;
    try {
        flow = (await getFlows(database, [request.urlParams.flowId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!flow) {
        request.end(400, "This flow does not exist");
        return;
    }

    let inflow;
    if (request.jsonBody.inflow !== null) {
        try {
            inflow = (await getInflows(database, [request.jsonBody.inflow]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            return;
        }

        if (!inflow) {
            request.end(400, "This inflow does not exist");
            return;
        }
    }

    let outflow;
    if (request.jsonBody.outflow !== null) {
        try {
            outflow = (await getOutflows(database, [request.jsonBody.outflow]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            return;
        }

        if (!outflow) {
            request.end(400, "This outflow does not exist");
            return;
        }
    }

    let id;
    try {
        id = (await database.query("INSERT INTO flows_links (flow_id, inflow_id, outflow_id, amount) VALUES (?, ?, ?, ?)", [flow.id, inflow?.id ?? null, outflow?.id ?? null, request.jsonBody.amount]))[0].insertId;
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(200, { id });
}

module.exports.infos = {
    path: "/flows/:flowId/links",
    method: "POST",
    requiresAuth: true
}
