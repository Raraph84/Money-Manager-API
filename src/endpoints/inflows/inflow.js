const { getInflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") || [];

    let inflow;
    try {
        inflow = (await getInflows(database, [request.urlParams.inflowId], includes))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!inflow) {
        request.end(400, "This inflow does not exist");
        return;
    }

    request.end(200, inflow);
}

module.exports.infos = {
    path: "/inflows/:inflowId",
    method: "GET",
    requiresAuth: true
}
