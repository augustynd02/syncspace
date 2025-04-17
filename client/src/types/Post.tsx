import User from "./User";
import Like from "./Like";
import Comment from "./Comment";

export default interface Post{
    id: string;
    title: string;
    message?: string;
    imageUrl?: string;
    created_at: string;
    user: User
    likes: Like[];
    comments: Comment[];
    hasLiked: boolean;
}
