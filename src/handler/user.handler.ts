import { User } from "@/model";
import { createOne, deleteOne, getOne, getAll, updateOne } from "./handler_factory.ts";
import { createUserJoi, updateUserJoi } from "@/validation/user.joi.ts";

export const createUser = createOne(User, {
  schema: createUserJoi,
});

export const updateUser = updateOne(User, { schema: updateUserJoi });
export const deleteUser = deleteOne(User);
export const getUser = getOne(User);
export const getUsers = getAll(User);
