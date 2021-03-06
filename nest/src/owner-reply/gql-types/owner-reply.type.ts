import { ObjectType, Field } from "@nestjs/graphql";
import { UserType } from "src/user/gql-types/user.type";

@ObjectType()
export class OwnerReplyType {
    /**
     * The user object that made this owner reply.
     */
    @Field(() => UserType)
    user: UserType;
    /**
     * The actual content of this owner reply.
     */
    @Field()
    review: string;
    /**
     * An array of user objects that have liked this ownerReply.
     */
    @Field(() => [UserType])
    likes: UserType[];
    /**
     * An array of user objects that have disliked this ownerReply.
     */
    @Field(() => [UserType])
    dislikes: UserType[];
    /**
     * The date this ownerReply was made.
     */
    @Field({ nullable: true })
    date: Date;
    @Field({ nullable: true })
    edited: Date;
}