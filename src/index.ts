import axios, {AxiosResponse} from 'axios';
import * as fs from 'fs'; // Import the file system module
import dotenv from 'dotenv';

dotenv.config();


let FILENAMES: string[] = [];

const getToken = async () => {

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

const postReportData = async (token: string) => {
    // TODO: Add cluster id as an action input, get report ids from http request,
    const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/export/report/definition/json';
    const data = [
        "3576b30e-63bd-402e-a656-a0bc7d1bf73a",
        "ff80541e-8bd9-40f6-90ee-ce888b408e20"
    ];
    // const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFVVXdPVFpDUTBVM01qZEVRME0wTkRFelJrUkJORFk0T0RZeE1FRTBSa1pFUlVWRVF6bERNZyJ9.eyJodHRwczovL2NhbXVuZGEuY29tL29yZ0lkIjoiNGU2ZjgyMTEtODI1Ny00MGIzLWJiMmYtN2FmNmRkZTA3MjgxIiwiaXNzIjoiaHR0cHM6Ly93ZWJsb2dpbi5jbG91ZC5jYW11bmRhLmlvLyIsInN1YiI6Im13bzkwdDJyMzE2MDd6MzZCTkg2OXRXRktCWDU1ajFXQGNsaWVudHMiLCJhdWQiOiJvcHRpbWl6ZS5jYW11bmRhLmlvIiwiaWF0IjoxNzA2MDE1MTYzLCJleHAiOjE3MDYxMDE1NjMsImF6cCI6Im13bzkwdDJyMzE2MDd6MzZCTkg2OXRXRktCWDU1ajFXIiwic2NvcGUiOiJlYWMwMTJmNy00Njc4LTQzYjctYmZlZi03N2Q3ODA3MWRkY2UiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.HCbs2nYmUcWDb_THNnfz8izWMRL5_yVlJNJlnnCNQLqmgW42ExNgLfnqMjfsAGbGhMPzQ_N2jaSaFt-QDnf2sxTlq014npRmdccPjynQ0Mx6x0iHwLHqGWFP0EKFtW7qbGlnR2QlsiBDEueHGoyQBP2zQqNyd0bDjg_Cxl2gNoERVR_q8fLipvDBOBtVmud8tC_Uh0MODiHRNmVFYgcEMXQxCqkZp2ObkD6U6M9GYixUhlxrTO0XJhoUxOddQzcF_-Xzfww4e6r-1wqt84HUk_tZnuLVa-XNf4rUvox9-V-Ng_BG-59YS0gnBrzA-HbcUKDo3o-mZ9QzQrzFVgnLcw'; // Replace with your actual token

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response: AxiosResponse = await axios.post(url, data, {headers});
        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Write to a JSON file
        // const filename = 'response_data.json';
        // fs.writeFile(filename, JSON.stringify(response.data, null, 2), 'utf8', (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //     } else {
        //         console.log(`Data written to file ${filename}`);
        //     }
        // });


    } catch (error) {
        console.error('Error:', error);
    }
};

// const importReportData = async () => {
//
//     const url = 'https://bru-2.optimize.camunda.io/eac012f7-4678-43b7-bfef-77d78071ddce/api/public/import?collectionId=0fac1778-5c82-4425-900a-921df321a499';
//
//     const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//     };
//
//
// }


const runWorkflow = async () => {

    try {

        const token = await getToken();
        // console.log(`Optimize token: ${token}`);

        await postReportData(token)

        // const reportIds = await getFileIdsByMilestoneTag(token);
        // const reportIds: string[] = [
        //     "3576b30e-63bd-402e-a656-a0bc7d1bf73a",
        //     "ff80541e-8bd9-40f6-90ee-ce888b408e20"
        // ];
        // const fileContent = await getFileContent(token, reportIds)
        //
        // if (fileContent.length === 0) {
        //     console.log('No file content received.');
        //     return;
        // }


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

