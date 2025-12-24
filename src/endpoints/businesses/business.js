const { getBusinesses } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    let business;
    try {
        business = (await getBusinesses(database, [request.urlParams.businessId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!business) {
        request.end(400, "This business does not exist");
        return;
    }

    request.end(200, business);
};

module.exports.infos = {
    path: "/businesses/:businessId",
    method: "GET",
    requiresAuth: true
};
