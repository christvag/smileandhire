import bcrypt from "bcrypt";
import { supabase } from "../db/supabase";
import { IdPrefix, UserRole } from "./enum";
import jwt from "jsonwebtoken";
import { customAlphabet } from 'nanoid';

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const generateId = (prefix: string): string => {
    if (!Object.values(IdPrefix).includes(prefix as IdPrefix)) {
        throw new Error("Invalid role prefix: " + prefix);
    };

    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
    return `${prefix}_${nanoid()}`;
};

export const generateTokens = (userId: string, role: UserRole): { accessToken: string; refreshToken: string } => {
    const accessToken = jwt.sign(
        { userId, role }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { userId, role }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

export const createRoleData = async (role: string, userId: string): Promise<boolean> => {
    const roles = ["CLIENT", "ADMIN", "APPLICANT"];
    if (!roles.includes(role)) {
        throw new Error("Invalid role: " + role);
    };

    let dataCreated = false;
    const roleId = generateId(role.toLowerCase());

    switch (role) {
        case "CLIENT":
            // Update client role data logic here
            break;
        case "ADMIN":
            // Update admin role data logic here
            break;
        case "APPLICANT":
            // Update applicant role data logic here
            const applicantData = await supabase
                .from("applicants")
                .insert({
                    id: roleId,
                    userId,
                    completionPercentage: 20,
                    updatedAt: new Date().toISOString()
                })
                .select("id, userId, completionPercentage")
                .single();
            
            if (applicantData.error) {
                throw new Error("Failed to create applicant data: " + applicantData.error);
            }

            dataCreated = true;
            break;
    };

    return dataCreated;
};
