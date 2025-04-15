export default interface Like {
    id: number;
    user_id: number;
    post_id?: number;
    comment_id?: number;
    like_at: string;
}
