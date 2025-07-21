import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from "aws-amplify";
import { parseAmplifyConfig } from "aws-amplify/utils";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import Rating from "./assets/Pages/Rating.tsx";

const amplifyConfig = parseAmplifyConfig(outputs);

Amplify.configure(
  {
    ...amplifyConfig,
    API: {
      ...amplifyConfig.API,
      REST: outputs.custom.API,
    },
  }
);
Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator><Rating /></Authenticator>
  </React.StrictMode>
);
