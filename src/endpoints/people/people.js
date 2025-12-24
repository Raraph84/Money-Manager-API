const { getPeople } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request
 * @param {import("mysql2/promise").Pool} database
 */
module.exports.run = async (request, database) => {
    let people;
    try {
        people = await getPeople(database);
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    request.end(200, { people });
};

module.exports.infos = {
    path: "/people",
    method: "GET",
    requiresAuth: true
};
