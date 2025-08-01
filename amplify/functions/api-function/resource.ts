import { defineFunction, secret} from "@aws-amplify/backend";
export const sportsProfile = defineFunction({
  name: "SportsProfile",
  entry: "./SportsProfile.ts", 
  environment: {
    Location_API_URL: secret("Location_API_URL"),
    Weather_API_URL: secret("Weather_API_URL"),
    Weather_API_KEY : secret("Weather_API_KEY"), 
    People_API_URL: secret("People_API_URL")
  }
}); 
export const sportsPersonalization = defineFunction({
  name: "SportsPersonalization",
  entry: "./SportsPersonalization.ts", 
}); 