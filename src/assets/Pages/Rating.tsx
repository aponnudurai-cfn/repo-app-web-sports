import type { Schema } from "../../../amplify/data/resource";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";



const client = generateClient<Schema>();

export function Rating() {
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
            const rating = window.prompt("Enter your ranking (1-5):");
            if (!rating || isNaN(parseInt(rating, 10)) || 
                parseInt(rating, 10) < 1 || 
                parseInt(rating, 10) > 5) {
                console.error("Rating must be a number between 1 and 5.");
                return;
            }

            const year = window.prompt("Enter the year of the rating:");
            if (!year || isNaN(parseInt(year, 10)) || parseInt(year, 10) < 2020 || parseInt(year, 10) > new Date().getFullYear()) {
                console.error("Year must be a valid year between 2020 and the current year.");
                return;
            }

            const semester = window.prompt("Enter the semester (1-4):");
            if (!semester || isNaN(parseInt(semester, 10)) || 
                parseInt(semester, 10) < 1 || 
                parseInt(semester, 10) > 4) {
                console.error("Semester must be a number between 1 and 4.");
                return;
            }

             const response = await client.models.Rating.create({
                Subject: subject,
                Year: parseInt(year, 10),
                Semester: parseInt(semester, 10),   
                Ranking: parseInt(rating, 10),
                professorId: crypto.randomUUID(),
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
                    {rating.Subject} - {rating.Ranking}
                </li>
            ))}
        </ul>
    </div>
}

