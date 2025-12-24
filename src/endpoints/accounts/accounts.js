const { getAccounts } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    let accounts;
    try {
        accounts = await getAccounts(database);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { accounts });
};

module.exports.infos = {
    path: "/accounts",
    method: "GET",
    requiresAuth: true
};
