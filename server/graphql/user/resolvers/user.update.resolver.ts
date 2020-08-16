import User from "../../../database/models/User";
import IUser from "../../../types/IUser";
import { ValidationError } from "apollo-server-express";
import Socket from "../../../WebSocket";
const WebSocket = Socket.getSocket();

const UserUpdateResolver = {
    User: {
        // update the user. parent is the user object that is returned
        update: async (parent: IUser, { data }: { data: IUser }) => {
            let foundUser;
            try {
                foundUser = await User.findOneAndUpdate({ id: parent.id }, data, { new: true, useFindAndModify: false });
            } catch (err) {
                return new ValidationError("Something went wrong while saving to the database");
            }
            WebSocket.emit("user-update", foundUser);
            return foundUser;
        },
    },
};

export default UserUpdateResolver;