const { getOutflows } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    const includes = request.searchParams.get("includes")?.toLowerCase().split(",") ?? [];
    const people = request.searchParams.get("people")?.split(",") ?? null;

    let outflows;
    try {
        outflows = await getOutflows(database, null, people, includes);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { outflows });
}

module.exports.infos = {
    path: "/outflows",
    method: "GET",
    requiresAuth: true
}
