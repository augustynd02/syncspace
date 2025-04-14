'use client'

import Button from "../Button/Button";
import Friendship from "@/types/Friendship";


export default function FriendshipButton({ friendship, currentUserId }: { friendship: Friendship | undefined, currentUserId: string;}) {
    const handleClick = async () => {
        const response = await fetch(`http://localhost:8000/api/friendships?user1=${friendship?.receiver_id}&user2=${friendship?.requester_id}`, {
            method: 'PUT',
            credentials: 'include'
        })
    }


    const getButtonText = () => {
        switch (friendship?.status) {
            case 'accepted':
                return 'Unfriend';
            case 'pending':
                if (parseInt(currentUserId) === friendship.requester_id) {
                    return 'Request sent';
                } else {
                    return 'Accept request';
                }
            default:
                return 'Send friend request';
        }
    };

    return (
        <Button
            onClick={handleClick}
        >
            {getButtonText()}
        </Button>
    )
}
