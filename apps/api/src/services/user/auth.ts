import RootService from "../_root";
import { Request, Response, NextFunction } from "express";
import { RegisterUserSchema } from "../../validations/auth";
import { supabase } from "../../db/supabase";
import { createRoleData, generateId, generateTokens, hashPassword } from "../../utils/auth";
import { logger } from "../../utils/logger";
import { IUser } from "../../models/user/auth";

class AuthService extends RootService {
    async registerUser(request: Request, response: Response, next: NextFunction) {
        try {
            const body = request.body;

            const { error } = RegisterUserSchema.safeParse(body);
            if (error) {
                return this.handle_validation_errors(error, response);
            };

            const { email, password, firstName, lastName } = body;

            const { data: existingUser } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (existingUser) {
                return response.status(400).json({ error: "User already exists" });
            };

            const hashedPassword = await hashPassword(password);
            const userId = generateId("user");

            const new_user = await supabase
                .from("users")
                .insert({
                    id: userId,
                    email,
                    passwordHash: hashedPassword,
                    firstName,
                    lastName,
                    isVerified: true,
                    updatedAt: new Date().toISOString() // Ensures TIMESTAMP(3) format
                })
                .select("id, email, role, firstName, lastName")
                .single();

            console.log("new_user created:", new_user);

            if (new_user.error) {
                return response.status(500).json({ 
                    error: "Failed to create user",
                    details: new_user.error
                });
            };

            const user = new_user.data as unknown as IUser;

            const roleDataCreated = await createRoleData(user.role, user.id);
            console.log("Role data created:", roleDataCreated);
            if (!roleDataCreated) {
                console.error("Failed to create role data for user:", user.id);
                return response.status(500).json({ error: "Failed to create role data" });
            };

            const tokens = generateTokens(user.id, user.role);

            return response.status(201).json({
                success: true,
                user,
                ...tokens
            });

        } catch (error) {
            console.error('Registration error:', error);
            return response.status(500).json({
                success: false,
                error: "Error registering user",
                details: error
            });
        };
    };
};

export const auth_service = new AuthService();
