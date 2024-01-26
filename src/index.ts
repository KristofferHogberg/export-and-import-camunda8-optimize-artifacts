import axios, {AxiosResponse} from 'axios';
import * as fs from 'fs'; // Import the file system module
import dotenv from 'dotenv';

// TODO: Remove after running on GitHub runner.
dotenv.config();


let TOKEN = '';
let CONNECTION_TYPE = 'self-managed';
// let CONNECTION_TYPE = 'cloud';

const BASE_ADDRESS = 'https://akstest.apendo.se/optimize'
// const BASE_ADDRESS = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce';

// SELF-MANAGED
const COLLECTION_ID_SOURCE = 'bb74ffa1-b15c-4169-983a-da4bd826c041';
const COLLECTION_ID_DESTINATION = '6c1aecaf-30a3-4e2a-8a0e-c466e62b61ce';

// CLOUD
// const COLLECTION_ID_SOURCE = '73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
// const COLLECTION_ID_DESTINATION = '0fac1778-5c82-4425-900a-921df321a499';

const getTokenCloud = async () => {
    try {
        const url = 'https://login.cloud.camunda.io/oauth/token';
        const data = {
            grant_type: 'client_credentials',
            audience: 'optimize.camunda.io',
            client_id: process.env.CLIENT_ID,       // Use environment variable
            client_secret: process.env.CLIENT_SECRET //
        };

        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const token = response.data.access_token

            // Remove all whitespaces from token
            return token.replace(/\s+/g, '');

        } else {
            console.error('Error:', response.statusText);
            return null;
        }
    } catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
        // return null;
    }
}

const getTokenSelfManaged = async () => {

    try {
        const url = 'https://akstest.apendo.se/auth/realms/camunda-platform/protocol/openid-connect/token';
        const data = {
            grant_type: 'client_credentials',
            audience: 'optimize-api',
            client_id: process.env.SM_CLIENT_ID,
            client_secret: process.env.SM_CLIENT_SECRET
        };

        const response = await axios.post(url, data, {
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
            const token = response.data.access_token

            // Remove all whitespaces from token
            return token.replace(/\s+/g, '');

        } else {
            console.error('Error:', response.statusText);
            return null;
        }
    } catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
        // return null;
    }
}

const getOptimizeDashboardIds = async (token: string) => {
    const url = `${BASE_ADDRESS}/api/public/dashboard?collectionId=${COLLECTION_ID_SOURCE}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await axios.get(url, {headers});
        return response.data.map((report: { id: any; }) => report.id)

    } catch (error) {
        console.error('Error:', error);
    }

}

const getOptimizeReportIds = async (token: string) => {
    const url = `${BASE_ADDRESS}/api/public/report?collectionId=${COLLECTION_ID_SOURCE}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await axios.get(url, {headers});
        return response.data.map((report: { id: any; }) => report.id)

    } catch (error) {
        console.error('Error:', error);
    }

}

const exportDashboardDefinitions = async (token: string, reportIds: string[]) => {
    const url = `${BASE_ADDRESS}/api/public/export/dashboard/definition/json`
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response: AxiosResponse = await axios.post(url, reportIds, {headers});
        return response.data;

    } catch (error) {
        console.error('Error:', error);
    }
};

const exportReportDefinitions = async (token: string, reportIds: string[]) => {
    const url = `${BASE_ADDRESS}/api/public/export/report/definition/json`
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response: AxiosResponse = await axios.post(url, reportIds, {headers});
        return response.data;

    } catch (error) {
        console.error('Error:', error);
    }
};

const importOptimizeDefinitions = async (token: string, optimizeEntityDefinitionsData: any) => {
    const url = `${BASE_ADDRESS}/api/public/import?collectionId=${COLLECTION_ID_DESTINATION}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response: AxiosResponse = await axios.post(url, optimizeEntityDefinitionsData, {headers});
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }

}

const writeOptimizeEntityToFile = async (optimizeEntityData: any) => {
    try {
        const filename = 'exported_optimize_entities.json';
        fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log(`Data written to file ${filename}`);
            }
        });


    } catch (error) {
        console.error('Error:', error);
    }

}

const readOptimizeEntityFromFile = async (optimizeEntityData: any) => {
    try {

    } catch (error) {
        console.error('Error:', error);
    }

}

const runWorkflow = async () => {
    try {
        if (CONNECTION_TYPE === 'cloud') {

            TOKEN = await getTokenCloud()

        } else if (CONNECTION_TYPE === 'self-managed') {

            TOKEN = await getTokenSelfManaged()

        } else {
            console.error('Invalid connection_type specified.');
            process.exit(1);
        }

        if (!TOKEN) {
            console.error('Failed to retrieve token.');
            return; // or throw new Error('Failed to retrieve token.');
        }

        // const dashboardIds = await getOptimizeDashboardIds(TOKEN)
        const reportIds = await getOptimizeReportIds(TOKEN)

        // const dashboardDefinitions = await exportDashboardDefinitions(TOKEN, dashboardIds)
        const reportDefinitions = await exportReportDefinitions(TOKEN, reportIds)

        // await writeOptimizeEntityToFile(dashboardDefinitions)
        await writeOptimizeEntityToFile(reportDefinitions)

        // await importOptimizeDefinitions(TOKEN, dashboardDefinitions)
        await importOptimizeDefinitions(TOKEN, reportDefinitions)

        // console.log('Dashboard Definitions: : ', JSON.stringify(reportIds, null, 2));

    } catch (error) {
        // setFailed(error instanceof Error ? error.message : 'An error occurred');
    }

}

runWorkflow()
    .then(() => {
        console.log("Workflow completed successfully.");
    })
    .catch((error) => {
        console.error("Workflow failed:", error);
    });