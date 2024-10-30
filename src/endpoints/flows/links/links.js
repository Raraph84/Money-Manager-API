const { getFlows, getFlowsLinks } = require("../../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") ?? [];

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

    let links;
    try {
        links = await getFlowsLinks(database, null, [flow.id], null, null, includes);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { links });
}

module.exports.infos = {
    path: "/flows/:flowId/links",
    method: "GET",
    requiresAuth: true
}
