import axios, {AxiosResponse} from 'axios';
import * as fs from 'fs'; // Import the file system module
import dotenv from 'dotenv';

// TODO: Remove after running on GitHub runner.
dotenv.config();

//TODO: Add Url and credentials from gh inputs.
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

// TODO: Get url from gh input
const getOptimizeDashboardIds = async (token: string) => {
    const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/dashboard?collectionId=73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await axios.get(url, {headers});
        // Extract the IDs from the response data
        // Adjust the mapping based on the actual structure of response.data
        // Assuming each report object has an 'id' field
        return response.data.map((report: { id: any; }) => report.id)
    } catch (error) {
        console.error('Error:', error);
    }

}

// TODO: Get url from gh input
const getOptimizeReportIds = async (token: string) => {
    const url = 'https://akstest.apendo.se/optimize/api/public/report?collectionId=bb74ffa1-b15c-4169-983a-da4bd826c041';
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/report?collectionId=73eac2ad-6f12-46f0-aac3-ab12e9ea1184';
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

const exportReportData = async (token: string, reportIds: string[]) => {
    // TODO: Add cluster id as an action input, get report ids from http request,
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/export/report/definition/json'
    const url = 'https://akstest.apendo.se/optimize/api/public/export/report/definition/json'
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

const importReportData = async (token: string, data: any) => {
    //  TODO: Add collection id as action input.
    // const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/import?collectionId=0fac1778-5c82-4425-900a-921df321a499';
    const url = 'https://akstest.apendo.se/optimize/api/public/import?collectionId=bb74ffa1-b15c-4169-983a-da4bd826c041';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response: AxiosResponse = await axios.post(url, data, {headers});
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }

}

const writeOptimizeEntityToFile = async (optimizeEntityData: any) => {
    try {
        // Write to json
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
        // Write to json
        // const filename = 'response_data.json';
        // fs.writeFile(filename, JSON.stringify(optimizeEntityData, null, 2), 'utf8', (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //     } else {
        //         console.log(`Data written to file ${filename}`);
        //     }
        // });


    } catch (error) {
        console.error('Error:', error);
    }

}

const runWorkflow = async () => {
    try {
        // const tokenCloud = await getTokenCloud();
        const tokenSM = await getTokenSelfManaged()
        const reportIds = await getOptimizeReportIds(tokenSM)
        // const reportIds = await getOptimizeReportIds(tokenCloud)
        // const dashboardIds = await getOptimizeDashboardIds(tokenCloud)
        const reportData = await exportReportData(tokenSM, reportIds)
        // const reportData = await exportReportData(tokenCloud, reportIds)

        // await writeOptimizeEntityToFile(reportData)
        // await importReportData(tokenCloud, reportData)
        await importReportData(tokenSM, reportData)
        // console.log('Report IDs: ', JSON.stringify(reportIds, null, 2));

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