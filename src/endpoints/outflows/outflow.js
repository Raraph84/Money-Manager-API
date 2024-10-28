const { getOutflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") || [];

    let outflow;
    try {
        outflow = (await getOutflows(database, [request.urlParams.outflowId], includes))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!outflow) {
        request.end(400, "This outflow does not exist");
        return;
    }

    request.end(200, outflow);
}

module.exports.infos = {
    path: "/outflows/:outflowId",
    method: "GET",
    requiresAuth: true
}
