import { UserRole } from "../../utils/enum";

export interface IUser {
    id: string;
    name?: string;
    email: string;
    emailVerified?: Date;
    image?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
    role: UserRole;
    isBanned: boolean;
    banReason?: string;
    strikeCount: number;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    avatar?: string;
    phone?: string;
    username?: string;
}
