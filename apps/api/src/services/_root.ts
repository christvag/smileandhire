import { Response } from "express";

class RootService {
    constructor() {};

    handle_validation_errors(error: any, response: Response) {
        if (error) {
            const errorMessages = error.errors.map((detail: any) => detail.message.replace(/\"/g, ""));
            console.error("Validation errors:", errorMessages);
            return response.status(400).json({
                error: "Validation failed",
                validation_errors: errorMessages,
                status_code: 400
            });
        };
    };
};

export default RootService;