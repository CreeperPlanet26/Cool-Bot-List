import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "./review.schema";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { Bot } from "src/bot/bot.schema";

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name)
        private Reviews: Model<Review>,
        @InjectModel(User.name)
        private Users: Model<User>,
        @InjectModel(Bot.name)
        private Bots: Model<Bot>
    ) { }

    public async getBot(review: Review): Promise<Bot> {
        return await this.Bots.findOne({ id: review.botId });
    }

}