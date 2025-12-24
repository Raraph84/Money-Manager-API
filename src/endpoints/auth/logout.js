/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    try {
        await database.query("DELETE FROM tokens WHERE token=?", [request.headers.authorization]);
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        return;
    }

    request.end(204);
};

module.exports.infos = {
    path: "/auth/logout",
    method: "POST",
    requiresAuth: true
};
