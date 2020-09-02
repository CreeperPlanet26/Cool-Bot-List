import { Module } from "@nestjs/common";
import { ReviewModule } from "src/review/review.module";
import { BotResolver } from "./bot.resolver";
import { BotService } from "./bot.service";
import { MongooseModule } from "@nestjs/mongoose";
import { BotSchema, Bot } from "./bot.schema";
import { User, UserSchema } from "src/user/user.schema";
import { Review, ReviewSchema } from "src/review/review.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Bot.name, schema: BotSchema },
            { name: User.name, schema: UserSchema },
            { name: Review.name, schema: ReviewSchema },
        ]),
        ReviewModule,
    ],
    providers: [BotResolver, BotService],
})
export class BotModule { }