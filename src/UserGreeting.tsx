import React, { useEffect, useState } from 'react';
import outputs from '../amplify_outputs.json';

type UserGreetingProps = {
    token: string;
};

const UserGreeting: React.FC<UserGreetingProps> = ({ token }) => {
    const [greeting, setGreeting] = useState<string | null>(null);
    useEffect(() => {
        async function getGreeting() {
            if (token) {
                try {

                   
                    const endpoint = outputs.custom.API.SportsPortalApi.endpoint;
                    const resource = 'SportsProfile'; // Adjust the path as needed
                    const url = `${endpoint}${resource}`;
                    console.log('url', url);
                    console.log('cognito token', token);
                    
                    const response = await fetch(url, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`, // now correctly passed from props
                        },
                    });

                    const data = await response.json();
                    console.log('API response:', data);
                    setGreeting(`Welcome ${data.FirstName}, ${data.LastName}`); // assuming data contains name, state, and country
                } catch (error) {
                    console.error("API call failed:", error);
                    setGreeting("API call failed");
                }
            }
        }
        getGreeting();
    }, [token]); // dependency added
    if (!greeting) return <div>Loading ...</div>;
    return (
        <div>
            <h2>{greeting}</h2>
        </div>
    );
};

export default UserGreeting;
