import { useState } from "react";
import { generateClient } from "aws-amplify/api";


const client = generateClient();

export default function SubmitRating() {
    const [rating, setRating] = useState('');
    const [subject, setSubject] = useState('');

    const submitRating = async () => {
        try {
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
        <button onClick={submitRating}>Submit</button>
    </div>
}