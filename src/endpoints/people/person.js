const { getPeople } = require("../../resources");

/**
 * @param {import("raraph84-lib/src/Request")} request 
 * @param {import("mysql2/promise").Pool} database 
 */
module.exports.run = async (request, database) => {

    let person;
    try {
        person = (await getPeople(database, [request.urlParams.personId]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        return;
    }

    if (!person) {
        request.end(400, "This person does not exist");
        return;
    }

    request.end(200, person);
}

module.exports.infos = {
    path: "/people/:personId",
    method: "GET",
    requiresAuth: true
}
