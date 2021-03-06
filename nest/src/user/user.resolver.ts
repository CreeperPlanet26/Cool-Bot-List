import { Args, Parent, Query, ResolveField, Resolver, Context, Mutation } from "@nestjs/graphql";
import { Bot } from "src/bot/bot.schema";
import { BotType } from "src/bot/gql-types/bot.type";
import { VoteType } from "src/vote/gql-types/vote.type";
import { Vote } from "src/vote/interfaces/vote.interface";
import { UserType } from "./gql-types/user.type";
import { User } from "./user.schema";
import { UserService } from "./user.service";
import { HttpException } from "@nestjs/common";
import { UserUpdatable } from "./gql-types/user-updatable.type";
import { AdminMethodResolvable } from "./constants/admin-methods.enum";

@Resolver(() => UserType)
export class UserResolver {
    constructor(private service: UserService) { }

    @Query(() => [UserType], { nullable: true })
    public users(): Promise<User[]> {
        return this.service.getAll();
    }

    @Query(() => UserType, { nullable: true })
    public user(@Args("id") id: string): Promise<User> {
        return this.service.get(id);
    }

    @Query(() => [UserType], { nullable: true })
    public admins(): Promise<User[]> {
        return this.service.getAdmins();
    }

    @Query(() => UserType)
    public me(@Context("req") { user }: { user: User }): User | HttpException {
        return this.service.getMe(user);
    }

    @ResolveField("bots", () => [BotType])
    public bots(@Parent() user: User): Promise<Bot[]> {
        return this.service.getBots(user);
    }

    @ResolveField("bot", () => BotType, { nullable: true })
    public bot(@Parent() user: User, @Args("id") id: string): Promise<Bot | HttpException> {
        return this.service.getBot(user, id);
    }

    @ResolveField("vote", () => VoteType, { nullable: true })
    public vote(@Parent() user: User): Promise<Vote> {
        return this.service.getVote(user);
    }

    @Mutation(() => UserType)
    public updateUser(@Args("userUpdatable") userUpdatable: UserUpdatable): Promise<User | HttpException> {
        return this.service.update(userUpdatable);
    }

    @Mutation(() => UserType)
    public deleteUser(@Args("id") id: string): Promise<User | HttpException> {
        return this.service.delete(id);
    }

    @Mutation(() => UserType)
    public makeAdmin(@Args("id") id: string, @Args("method") method: AdminMethodResolvable): Promise<User | HttpException> {
        return this.service.makeAdmin(id, method);
    }
}

