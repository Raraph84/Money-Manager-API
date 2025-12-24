const { getPeople, getBusinesses } = require("./resources");

const validatePerson = async (request, database) => {
    if (typeof request.jsonBody.person === "undefined") {
        request.end(400, "Missing person");
        throw new Error();
    }

    if (typeof request.jsonBody.person !== "number") {
        request.end(400, "Person must be a number");
        throw new Error();
    }

    let person;
    try {
        person = (await getPeople(database, [request.jsonBody.person]))[0];
    } catch (error) {
        request.end(500, "Internal server error");
        console.log(`SQL Error - ${__filename} - ${error}`);
        throw new Error();
    }

    if (!person) {
        request.end(400, "This person does not exist");
        throw new Error();
    }

    return person;
};

const validateFrom = async (request, database) => {
    if (typeof request.jsonBody.fromName === "undefined") {
        request.end(400, "Missing from name");
        throw new Error();
    }

    if (typeof request.jsonBody.fromName !== "string" && request.jsonBody.fromName !== null) {
        request.end(400, "From name must be a string or null");
        throw new Error();
    }

    if (
        request.jsonBody.fromName !== null &&
        (request.jsonBody.fromName.length < 2 || request.jsonBody.fromName.length > 50)
    ) {
        request.end(400, "From name must be between 2 and 50 characters");
        throw new Error();
    }

    if (typeof request.jsonBody.fromBusiness === "undefined") {
        request.end(400, "Missing from business");
        throw new Error();
    }

    if (typeof request.jsonBody.fromBusiness !== "number" && request.jsonBody.fromBusiness !== null) {
        request.end(400, "From business must be a number or null");
        throw new Error();
    }

    if (request.jsonBody.fromName === null && request.jsonBody.fromBusiness === null) {
        request.end(400, "From name and from business cannot be both null");
        throw new Error();
    }

    if (request.jsonBody.fromName !== null && request.jsonBody.fromBusiness !== null) {
        request.end(400, "From name and from business cannot be both set");
        throw new Error();
    }

    let fromBusiness;
    if (request.jsonBody.fromBusiness !== null) {
        try {
            fromBusiness = (await getBusinesses(database, [request.jsonBody.fromBusiness]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            throw new Error();
        }

        if (!fromBusiness) {
            request.end(400, "This business does not exist");
            throw new Error();
        }
    }

    return fromBusiness;
};

const validateTo = async (request, database) => {
    if (typeof request.jsonBody.toName === "undefined") {
        request.end(400, "Missing to name");
        throw new Error();
    }

    if (typeof request.jsonBody.toName !== "string" && request.jsonBody.toName !== null) {
        request.end(400, "To name must be a string or null");
        throw new Error();
    }

    if (
        request.jsonBody.toName !== null &&
        (request.jsonBody.toName.length < 2 || request.jsonBody.toName.length > 50)
    ) {
        request.end(400, "To name must be between 2 and 50 characters");
        throw new Error();
    }

    if (typeof request.jsonBody.toBusiness === "undefined") {
        request.end(400, "Missing to business");
        throw new Error();
    }

    if (typeof request.jsonBody.toBusiness !== "number" && request.jsonBody.toBusiness !== null) {
        request.end(400, "To business must be a number or null");
        throw new Error();
    }

    if (request.jsonBody.toName === null && request.jsonBody.toBusiness === null) {
        request.end(400, "To name and to business cannot be both null");
        throw new Error();
    }

    if (request.jsonBody.toName !== null && request.jsonBody.toBusiness !== null) {
        request.end(400, "To name and to business cannot be both set");
        throw new Error();
    }

    let toBusiness;
    if (request.jsonBody.toBusiness !== null) {
        try {
            toBusiness = (await getBusinesses(database, [request.jsonBody.toBusiness]))[0];
        } catch (error) {
            request.end(500, "Internal server error");
            console.log(`SQL Error - ${__filename} - ${error}`);
            throw new Error();
        }

        if (!toBusiness) {
            request.end(400, "This business does not exist");
            throw new Error();
        }
    }

    return toBusiness;
};

const validateAmount = (request) => {
    if (typeof request.jsonBody.amount === "undefined") {
        request.end(400, "Missing amount");
        throw new Error();
    }

    if (typeof request.jsonBody.amount !== "number") {
        request.end(400, "Amount must be a number");
        throw new Error();
    }
};

const validateFees = (request) => {
    if (typeof request.jsonBody.fees === "undefined") {
        request.end(400, "Missing fees");
        throw new Error();
    }

    if (typeof request.jsonBody.fees !== "number") {
        request.end(400, "Fees must be a number");
        throw new Error();
    }
};

const validateDescription = (request) => {
    if (typeof request.jsonBody.description === "undefined") {
        request.end(400, "Missing description");
        throw new Error();
    }

    if (typeof request.jsonBody.description !== "string" && request.jsonBody.description !== null) {
        request.end(400, "Description must be a string or null");
        throw new Error();
    }

    if (
        request.jsonBody.description !== null &&
        (request.jsonBody.description.length < 2 || request.jsonBody.description.length > 100)
    ) {
        request.end(400, "Description must be between 2 and 100 characters");
        throw new Error();
    }
};

const validateStartEndDates = (request) => {
    if (typeof request.jsonBody.startDate === "undefined") {
        request.end(400, "Missing start date");
        throw new Error();
    }

    if (typeof request.jsonBody.startDate !== "number" && request.jsonBody.startDate !== null) {
        request.end(400, "Start date must be a number or null");
        throw new Error();
    }

    if (typeof request.jsonBody.endDate === "undefined") {
        request.end(400, "Missing end date");
        throw new Error();
    }

    if (typeof request.jsonBody.endDate !== "number" && request.jsonBody.endDate !== null) {
        request.end(400, "End date must be a number or null");
        throw new Error();
    }

    if ((request.jsonBody.startDate === null) !== (request.jsonBody.endDate === null)) {
        request.end(400, "Start date and end date must be both set or both null");
        throw new Error();
    }
};

const validateDate = (request) => {
    if (typeof request.jsonBody.date === "undefined") {
        request.end(400, "Missing date");
        throw new Error();
    }

    if (typeof request.jsonBody.date !== "number") {
        request.end(400, "Date must be a number");
        throw new Error();
    }
};

module.exports = {
    validatePerson,
    validateFrom,
    validateTo,
    validateAmount,
    validateFees,
    validateDescription,
    validateStartEndDates,
    validateDate
};
