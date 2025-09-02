import Zod from "zod";

export const RequiredEmailSchema = Zod.object({
    email: Zod.string().email().min(2).max(100).trim().nonempty()
});

export const RequiredPasswordSchema = Zod.object({
    password: Zod.string().min(6).max(100).trim().nonempty()
});