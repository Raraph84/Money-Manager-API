const { getAccounts } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    let account;
    try {
        account = (await getAccounts(database, [request.urlParams.accountId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!account) {
        request.end(400, "This account does not exist");
        return;
    }

    request.end(200, account);
}

module.exports.infos = {
    path: "/accounts/:accountId",
    method: "GET",
    requiresAuth: true
}
