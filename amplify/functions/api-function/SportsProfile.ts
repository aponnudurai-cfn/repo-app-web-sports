import type { APIGatewayProxyHandler, APIGatewayProxyEvent  } from "aws-lambda";

// --- CORS headers ---
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

// --- Standard response builder ---
const createResponse = (statusCode: number, body: object) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

// --- Fetch location ---
const fetchProfileData = async (emailAddress: string) => {
  const url = `${process.env.People_API_URL}?email=${emailAddress}`;
  console.log(`Profile url - ${url}`)
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Location API error: ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
};



// --- Handle GET request --- 
const handleGetRequest = async (event: APIGatewayProxyEvent) => {
  
  try {
    const profile = await fetchProfileData("aponnudurai@commonwealth.com");
    if (!profile) {
      return createResponse(404, { error: "No location found for provided coordinates" });
    }

    const { FirstName, LastName, Description } = profile;
   
    return createResponse(200, {
      FirstName,
      LastName,
      Description
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return createResponse(500, { error: "Failed to fetch location or weather data" });
  }
};

// --- Lambda entrypoint ---
export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod.toUpperCase();
  console.log(`Received ${method} request`);

  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  if (method === "GET") {
    return handleGetRequest(event);
  }

  return createResponse(501, { error: `${method} not implemented yet` });
};
