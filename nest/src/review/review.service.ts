import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Review } from "./review.schema";
import { Model } from "mongoose";
import { User } from "src/user/user.schema";
import { Bot } from "src/bot/bot.schema";
import { OwnerReply } from "src/owner-reply/interfaces/ownerReply.interface";
import { ReviewCreatable } from "./gql-types/review-creatable.input";
import { NotificationService } from "src/notification/notification.service";
import { EventsGateway } from "src/events/events.gateway";

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name)
        private Reviews: Model<Review>,
        @InjectModel(User.name)
        private Users: Model<User>,
        @InjectModel(Bot.name)
        private Bots: Model<Bot>,
        private notificationService: NotificationService,
        private events: EventsGateway
    ) { }

    public async getBot(review: Review): Promise<Bot> {
        return this.Bots.findOne({ id: review.botId });
    }

    public async getUser(review: Review): Promise<User> {
        return this.Users.findOne({ id: review.userId });
    }

    public async getUsersThatLiked(review: Review): Promise<User[]> {
        const users: User[] = [];
        for (const id of review.likes) {
            users.push(await this.Users.findOne({ id }));
        }
        return users;
    }

    public async getUsersThatDisliked(review: Review): Promise<User[]> {
        const users: User[] = [];
        for (const id of review.dislikes) {
            users.push(await this.Users.findOne({ id }));
        }
        return users;
    }

    public async getOwnerReply(review: Review): Promise<OwnerReply> {
        if (review.ownerReply === undefined || review.ownerReply.review.length === 0) return null;
        return review.ownerReply;
    }

    public async create(data: ReviewCreatable): Promise<ReviewCreatable | HttpException> {
        const { botId, userId, review, rating } = data;

        if (rating > 5) return new HttpException("You can't have a rating over 5 stars!", HttpStatus.BAD_REQUEST);
        // Check if the bot exists
        const foundBot = await this.Bots.findOne({ id: botId });
        if (!foundBot) return new HttpException("That bot doesn't exist in the database.", HttpStatus.NOT_FOUND);
        // Check if the owner is trying to review
        if (foundBot.owners.some((id) => id === userId)) return new HttpException("You can't review your own bot.", HttpStatus.BAD_REQUEST);
        // Check if the user reviewing exists in the db -- also declaring the reviewer
        const reviewer = await this.Users.findOne({ id: userId });
        if (!reviewer) return new HttpException("The user reviewing this bot does not exist.", HttpStatus.NOT_FOUND);
        // Check if the user already reviewed this bot
        const userReviewed = await this.Reviews.findOne({ botId, userId });
        if (userReviewed) return new HttpException("You already reviewed this bot.", HttpStatus.FOUND);

        const newReview = new this.Reviews({ botId, userId, review, rating });
        foundBot.reviews.push(newReview._id);
        await foundBot.save();
        await newReview.save();

        await this.notificationService.handleReviewCreation(foundBot, reviewer, rating);

        const foundAfterUpdateBot = await this.Bots.findOne({ id: botId });
        const { reviews } = foundAfterUpdateBot;
        const ratings = [];
        for (const review of reviews) {
            const foundReview = await this.Reviews.findById(review);
            ratings.push(foundReview.rating);
        }

        let averageRating;
        if (ratings.length === 1) averageRating = ratings[0];
        else averageRating = ratings.reduce((a, b) => a + b) / ratings.length;
        foundBot.averageRating = averageRating;
        try {
            await foundBot.save();
        } catch (err) {
            return new HttpException("Something went wrong and the review was not saved to the database", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.events.emitNewReview(newReview);
        return newReview;
    }
}