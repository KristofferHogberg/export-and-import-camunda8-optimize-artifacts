"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = __importDefault(require("dotenv"));
const promises_1 = __importDefault(require("fs/promises"));
// TODO: Remove after running on GitHub runner.
dotenv_1.default.config();
let TOKEN = '';
// let CONNECTION_TYPE = 'self-managed';
let CONNECTION_TYPE = 'cloud';
// const BASE_ADDRESS = 'https://akstest.apendo.se/optimize'
const BASE_ADDRESS = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce';
// SELF-MANAGED
// const COLLECTION_ID_SOURCE = 'bb74ffa1-b15c-4169-983a-da4bd826c041';
// const COLLECTION_ID_DESTINATION = '6c1aecaf-30a3-4e2a-8a0e-c466e62b61ce';
// CLOUD
const COLLECTION_ID_SOURCE = '73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
const COLLECTION_ID_DESTINATION = '0fac1778-5c82-4425-900a-921df321a499';
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
const getOptimizeDashboardIds = async (token) => {
    const url = `${BASE_ADDRESS}/api/public/dashboard?collectionId=${COLLECTION_ID_SOURCE}`;
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
const getOptimizeReportIds = async (token) => {
    const url = `${BASE_ADDRESS}/api/public/report?collectionId=${COLLECTION_ID_SOURCE}`;
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
const exportDashboardDefinitions = async (token, reportIds) => {
    const url = `${BASE_ADDRESS}/api/public/export/dashboard/definition/json`;
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
const exportReportDefinitions = async (token, reportIds) => {
    const url = `${BASE_ADDRESS}/api/public/export/report/definition/json`;
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
const importOptimizeDefinitions = async (token, optimizeEntityDefinitionsData) => {
    const url = `${BASE_ADDRESS}/api/public/import?collectionId=${COLLECTION_ID_DESTINATION}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await axios_1.default.post(url, optimizeEntityDefinitionsData, { headers });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
};
// const writeOptimizeEntityToFile = async (optimizeEntityData: any) => {
//     try {
//         const filename = 'exported_optimize_entities.json';
//         fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//             } else {
//                 console.log(`Data written to file ${filename}`);
//             }
//         });
//
//
//     } catch (error) {
//         console.error('Error:', error);
//     }
//
// }
//
// // TODO: Fix output folder in project root instead of ./dist/optimize/
// const writeOptimizeEntityToFile = async (optimizeEntityData: any) => {
//     try {
//         const directory = path.join(__dirname, 'optimize'); // Sets the directory to 'project root/optimize'
//         const filename = path.join(directory, 'exported_optimize_entities.json'); // Full path to the file
//
//         // Create the directory if it doesn't exist
//         if (!fs.existsSync(directory)) {
//             fs.mkdirSync(directory, {recursive: true});
//         }
//
//         fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//             } else {
//                 console.log(`Data written to file ${filename}`);
//             }
//         });
//
//     } catch (error) {
//         console.error('Error:', error);
//     }
// };
// interface FileContent {
//     metadata: {
//         name: string;
//     };
//     content: string;
// }
const writeOptimizeEntityToFile = async (optimizeEntityData, destinationFolderPath, fileName) => {
    try {
        const destinationFilePath = node_path_1.default.join(destinationFolderPath, `${fileName}.json`);
        await promises_1.default.mkdir(destinationFolderPath, { recursive: true });
        // Convert optimizeEntityData to a JSON string
        const dataToWrite = JSON.stringify(optimizeEntityData, null, 2); // null, 2 for pretty formatting
        await promises_1.default.writeFile(destinationFilePath, dataToWrite);
        console.log(`File content saved to: ${destinationFilePath}`);
    }
    catch (error) {
        console.error('Error writing file:', error);
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
    }
};
const readOptimizeEntityFromFile = async (optimizeEntityData) => {
    try {
    }
    catch (error) {
        console.error('Error:', error);
    }
};
const runWorkflow = async () => {
    try {
        if (CONNECTION_TYPE === 'cloud') {
            TOKEN = await getTokenCloud();
        }
        else if (CONNECTION_TYPE === 'self-managed') {
            TOKEN = await getTokenSelfManaged();
        }
        else {
            console.error('Invalid connection_type specified.');
            process.exit(1);
        }
        if (!TOKEN) {
            console.error('Failed to retrieve token.');
            return; // or throw new Error('Failed to retrieve token.');
        }
        // const dashboardIds = await getOptimizeDashboardIds(TOKEN)
        const reportIds = await getOptimizeReportIds(TOKEN);
        // const dashboardDefinitions = await exportDashboardDefinitions(TOKEN, dashboardIds)
        const reportDefinitions = await exportReportDefinitions(TOKEN, reportIds);
        // await writeOptimizeEntityToFile(dashboardDefinitions)
        await writeOptimizeEntityToFile(reportDefinitions, 'optimize', 'optimize_entities');
        // await importOptimizeDefinitions(TOKEN, dashboardDefinitions)
        await importOptimizeDefinitions(TOKEN, reportDefinitions);
        // console.log('Dashboard Definitions: : ', JSON.stringify(reportIds, null, 2));
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
