import type { Schema } from "../../../amplify/data/resource";
import { useState } from "react";
import { generateClient } from "aws-amplify/api";



const client = generateClient<Schema>();

export default function SubmitRating() {
    const [rating, setRating] = useState('');
    const [subject, setSubject] = useState('');

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
                Rank: parseInt(rating, 10)
            });
            console.log('Rating submitted:', response);
            setRating('');
            setSubject('');
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    return <div>
        <h2>Submit Rating</h2>
        <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
        />
        <input
            type="number"
            placeholder="Rating (1-5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
        />
        <button onClick={submitRating}>Create Rating</button>
    </div>
}