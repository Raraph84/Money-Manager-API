const { getInflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") || [];

    let inflows;
    try {
        inflows = await getInflows(database, null, includes);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { inflows });
}

module.exports.infos = {
    path: "/inflows",
    method: "GET",
    requiresAuth: true
}
