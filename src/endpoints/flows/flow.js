const { getFlows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") || [];

    let flow;
    try {
        flow = (await getFlows(database, [request.urlParams.flowId], null, includes))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!flow) {
        request.end(400, "This flow does not exist");
        return;
    }

    request.end(200, flow);
}

module.exports.infos = {
    path: "/flows/:flowId",
    method: "GET",
    requiresAuth: true
}
