const { getBusinesses } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    let businesses;
    try {
        businesses = await getBusinesses(database);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { businesses });
};

module.exports.infos = {
    path: "/businesses",
    method: "GET",
    requiresAuth: true
};
