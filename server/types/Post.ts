import Like from "./Like.js";
import Comment from './Comment.js'

export default interface Post {
    id: number;
    message: string;
    image_name: string | null;
    created_at: Date;
    user: {
        id: number;
        name: string;
        middle_name: string | null;
        last_name: string;
        avatar_name: string;
        avatar_url?: string;
    };
    imageUrl?: string;
    hasLiked?: boolean;
    likes: Like[];
    comments: Comment[];
};
