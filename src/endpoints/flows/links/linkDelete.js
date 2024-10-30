const { getFlows, getInflows, getOutflows } = require("../../../resources");

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

    const link = flow.links.find((link) => link.id.toString() === request.urlParams.linkId);
    if (!link) {
        request.end(400, "This link does not exist");
        return;
    }

    try {
        await database.query("DELETE FROM flows_links WHERE flows_link_id=?", [link.id]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(204);
}

module.exports.infos = {
    path: "/flows/:flowId/links/:linkId",
    method: "DELETE",
    requiresAuth: true
}
