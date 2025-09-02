import Zod from "zod";
import { RequiredEmailSchema, RequiredPasswordSchema } from "./general";

export const RegisterUserSchema = Zod.object({
    ...RequiredEmailSchema.shape,
    ...RequiredPasswordSchema.shape,
    firstName: Zod.string().min(2).trim().nonempty(),
    lastName: Zod.string().min(2).trim().nonempty()
}).strict();