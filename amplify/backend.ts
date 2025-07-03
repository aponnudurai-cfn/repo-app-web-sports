import { defineBackend } from "@aws-amplify/backend";
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { sportsProfile, sportsPersonalization } from "./functions/api-function/resource";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { EndpointType } from "aws-cdk-lib/aws-apigateway";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

const backend = defineBackend({
  auth,
  data,
  sportsProfile,
  sportsPersonalization
});

// create a new API stack
const apiStack = backend.createStack("sports-api-stack");

const cognitoAuth = new CognitoUserPoolsAuthorizer(apiStack, "CognitoAuth", {
  cognitoUserPools: [backend.auth.resources.userPool],
});


// create a new REST API
const sportsPortalApi = new RestApi(apiStack, "SportsPortalApi", {
  restApiName: "SportsPortalApi",
  deploy: true,
  deployOptions: {
    stageName: "dev", 
  },
  endpointConfiguration: {
    types: [EndpointType.REGIONAL],
  },
});

// create a new Lambda integration
const sportsProfileIntegration = new LambdaIntegration(
  backend.sportsProfile.resources.lambda
);
const sportsPersonalizationIntegration = new LambdaIntegration(
  backend.sportsPersonalization.resources.lambda
);

const corsOptions = {
  integration: new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Authorization,X-Amz-Date,Content-Type,X-Api-Key,X-Amz-Security-Token'",
        'method.response.header.Access-Control-Allow-Methods': "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': '{"statusCode": 200}',
    },
  }),
  methodResponses: [{
    statusCode: '200',
    responseParameters: {
      'method.response.header.Access-Control-Allow-Headers': true,
      'method.response.header.Access-Control-Allow-Methods': true,
      'method.response.header.Access-Control-Allow-Origin': true,
    },
  }],
};

// create a new resource path with IAM authorization
const sportsProfileResource = sportsPortalApi.root.addResource("SportsProfile", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
  },
});
sportsProfileResource.addMethod("GET", sportsProfileIntegration); 
sportsProfileResource.addMethod(
  "OPTIONS",
  corsOptions.integration, {
    methodResponses: corsOptions.methodResponses,
    authorizationType: apigateway.AuthorizationType.NONE,
  }
);

const sportsPersonalizationResource = sportsPortalApi.root.addResource("SportsPersonalization", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.COGNITO,
    authorizer: cognitoAuth,
  },
});
sportsPersonalizationResource.addMethod("GET", sportsPersonalizationIntegration); 
sportsPersonalizationResource.addMethod(
  "OPTIONS",
  corsOptions.integration, {
    methodResponses: corsOptions.methodResponses,
    authorizationType: apigateway.AuthorizationType.NONE,
  }
);

// create a new IAM policy to allow Invoke access to the API
const sportsApiPolicy = new Policy(apiStack, "SportsApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${sportsPortalApi.arnForExecuteApi("*", "/SportsProfile", "dev")}`,
        `${sportsPortalApi.arnForExecuteApi("*", "/SportsProfile/*", "dev")}`,
        `${sportsPortalApi.arnForExecuteApi("*", "/SportsPersonalization", "dev")}`,
        `${sportsPortalApi.arnForExecuteApi("*", "/SportsPersonalization/*", "dev")}`,
      ],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  sportsApiPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  sportsApiPolicy
);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [sportsPortalApi.restApiName]: {
        endpoint: sportsPortalApi.url,
        region: Stack.of(sportsPortalApi).region,
        apiName: sportsPortalApi.restApiName,
      },
    },
  },
});