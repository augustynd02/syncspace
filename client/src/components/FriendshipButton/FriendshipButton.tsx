'use client'

import { useState } from "react";
import Button from "../Button/Button";
import Friendship from "@/types/Friendship";

export default function FriendshipButton({ friendship, currentUserId, userId }: { friendship: Friendship | undefined, currentUserId: string; userId: string; }) {
    const [currentFriendship, setCurrentFriendship] = useState(friendship);

    const handleClick = async () => {
        const { id1, id2 } = friendship
            ? { id1: friendship.requester_id, id2: friendship.receiver_id }
            : { id1: currentUserId, id2: userId };

        const response = await fetch(`http://localhost:8000/api/friendships?user1=${id1}&user2=${id2}`, {
            method: 'PUT',
            credentials: 'include'
        })

        const data = await response.json()
        const updatedFriendship: Friendship | undefined = data.friendship;

        setCurrentFriendship(updatedFriendship);
    }


    const getButtonText = () => {
        if (!currentFriendship) return 'Send friend request';
        switch (currentFriendship.status) {
            case 'accepted':
                return 'Unfriend';
            case 'pending':
                if (parseInt(currentUserId) === currentFriendship.requester_id) {
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
