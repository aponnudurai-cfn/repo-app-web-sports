import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";



const client = generateClient<Schema>();

export default function SubmitRating() {
    const [ratings, setRatings] = useState<Schema["Rating"]["type"][]>([]);

    const fetchRatings = async () => {
        const response = client.models.Rating.observeQuery().subscribe({
            next: (data) => setRatings([...data.items]),
        });
        return () => response.unsubscribe();
        /*try {
            const response = await client.models.Rating.list();
            setRatings(response.data ?? []);
        } catch (error) {
            console.error("Error fetching ratings:", error);
        }*/
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const submitRating = async () => {
        try {
            const subject = window.prompt("Enter the subject for the rating:");
            if (!subject) {
                console.error("Subject is required for rating.");
                return;
            }
            const rating = window.prompt("Enter your rating (1-5):");
            if (!rating || isNaN(parseInt(rating, 10)) || 
                parseInt(rating, 10) < 1 || 
                parseInt(rating, 10) > 5) {
                console.error("Rating must be a number between 1 and 5.");
                return;
            }

            
            const response = await client.models.Rating.create({
                Subject: subject,
                Rank: parseInt(rating, 10),
                professorId: window.prompt("Enter the professor ID:"),

            });
            console.log('Rating submitted:', response);
            fetchRatings(); // Refresh the list after submitting
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    return <div>
        <h2>Submit Rating</h2>
        <button onClick={submitRating}>Create Rating</button>
        <ul>
            {ratings.map((rating) => (
                <li key={rating.id}>
                    {rating.Subject} - {rating.Rank}
                </li>
            ))}
        </ul>
    </div>
}