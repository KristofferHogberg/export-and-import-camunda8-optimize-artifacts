"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs")); // Import the file system module
const dotenv_1 = __importDefault(require("dotenv"));
// TODO: Remove after running on GitHub runner.
dotenv_1.default.config();
//TODO: Add Url and credentials from gh inputs.
const getTokenCloud = async () => {
    try {
        const url = 'https://login.cloud.camunda.io/oauth/token';
        const data = {
            grant_type: 'client_credentials',
            audience: 'optimize.camunda.io',
            client_id: process.env.CLIENT_ID, // Use environment variable
            client_secret: process.env.CLIENT_SECRET //
        };
        const response = await axios_1.default.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            const token = response.data.access_token;
            // Remove all whitespaces from token
            return token.replace(/\s+/g, '');
        }
        else {
            console.error('Error:', response.statusText);
            return null;
        }
    }
    catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
        // return null;
    }
};
//TODO: Add Url and credentials from gh inputs. FIX data "undefined"
const getTokenSelfManaged = async () => {
    try {
        const url = 'https://akstest.apendo.se/auth/realms/camunda-platform/protocol/openid-connect/token';
        const data = {
            grant_type: 'client_credentials',
            audience: 'optimize-api',
            client_id: process.env.SM_CLIENT_ID,
            client_secret: process.env.SM_CLIENT_SECRET
        };
        const response = await axios_1.default.post(url, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        // const response = await axios.post(url, new URLSearchParams(data).toString(), {
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     }
        // });
        if (response.status === 200) {
            const token = response.data.access_token;
            // Remove all whitespaces from token
            return token.replace(/\s+/g, '');
        }
        else {
            console.error('Error:', response.statusText);
            return null;
        }
    }
    catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
        // return null;
    }
};
// TODO: Get url from gh input
const getOptimizeDashboardIds = async (token) => {
    const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/dashboard?collectionId=73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        // Extract the IDs from the response data
        // Adjust the mapping based on the actual structure of response.data
        // Assuming each report object has an 'id' field
        return response.data.map((report) => report.id);
    }
    catch (error) {
        console.error('Error:', error);
    }
};
// TODO: Get url from gh input
const getOptimizeReportIds = async (token) => {
    const url = 'https://akstest.apendo.se/optimize/api/public/report?collectionId=bb74ffa1-b15c-4169-983a-da4bd826c041';
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/report?collectionId=73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        return response.data.map((report) => report.id);
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const exportReportData = async (token, reportIds) => {
    // TODO: Add cluster id as an action input, get report ids from http request,
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/export/report/definition/json'
    const url = 'https://akstest.apendo.se/optimize/api/public/export/report/definition/json';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await axios_1.default.post(url, reportIds, { headers });
        return response.data;
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const importReportData = async (token, data) => {
    //  TODO: Add collection id as action input.
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/import?collectionId=0fac1778-5c82-4425-900a-921df321a499';
    const url = 'https://akstest.apendo.se/optimize/api/public/import?collectionId=bb74ffa1-b15c-4169-983a-da4bd826c041';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await axios_1.default.post(url, data, { headers });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const writeOptimizeEntityToFile = async (optimizeEntityData) => {
    try {
        // Write to json
        const filename = 'exported_optimize_entities.json';
        fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            }
            else {
                console.log(`Data written to file ${filename}`);
            }
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const readOptimizeEntityFromFile = async (optimizeEntityData) => {
    try {
        // Write to json
        // const filename = 'response_data.json';
        // fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //     } else {
        //         console.log(`Data written to file ${filename}`);
        //     }
        // });
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const runWorkflow = async () => {
    try {
        // const tokenCloud = await getTokenCloud();
        const tokenSM = await getTokenSelfManaged();
        const reportIds = await getOptimizeReportIds(tokenSM);
        // const reportIds = await getOptimizeReportIds(tokenCloud)
        // const dashboardIds = await getOptimizeDashboardIds(tokenCloud)
        const reportData = await exportReportData(tokenSM, reportIds);
        // const reportData = await exportReportData(tokenCloud, reportIds)
        // await writeOptimizeEntityToFile(reportData)
        // await importReportData(tokenCloud, reportData)
        await importReportData(tokenSM, reportData);
        // console.log('Report IDs: ', JSON.stringify(reportIds, null, 2));
    }
    catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
    }
};
runWorkflow()
    .then(() => {
    console.log("Workflow completed successfully.");
})
    .catch((error) => {
    console.error("Workflow failed:", error);
});
