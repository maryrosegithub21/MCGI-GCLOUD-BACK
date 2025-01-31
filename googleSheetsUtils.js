// const {google} = require('googleapis');

// async function fetchAndFilterData(authClient, spreadsheetId, range, searchQuery) {
//     const sheets = google.sheets({version: 'v4', auth: authClient});

//     try {
//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId: spreadsheetId,
//             range: range, // Use the range you need
//         });

//         let data = response.data.values;

//         if (!data || data.length === 0) {
//             console.warn('No data found in Google Sheet');
//             return []; // Return empty array if no data
//         }

//         if (searchQuery) {
//             const query = searchQuery.toLowerCase().trim();
//             data = data.filter(row =>
//                 row.some(cell =>
//                     String(cell).toLowerCase().includes(query)
//                 )
//             );
//         }

//         return data;
//     } catch (error) {
//         console.error('Error fetching or filtering ', error);
//         throw error; // Re-throw the error to be handled by the calling function
//     }
// }


// module.exports = {fetchAndFilterData}; // Export the function


// googleSheetsUtils.js (backend)
const {google} = require('googleapis');

async function fetchAndFilterData(authClient, spreadsheetId, range, searchQuery) {
    const sheets = google.sheets({version: 'v4', auth: authClient});

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        let data = response.data.values;

        if (!data || data.length === 0) {
            console.warn('No data found in Google Sheet');
            return []; // Return empty array if no data
        }

        // Filtering logic (adapt as needed)
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            data = data.filter(row =>
                row.some(cell =>
                    String(cell).toLowerCase().includes(query)
                )
            );
        }

        return data;
    } catch (error) {
        console.error('Error fetching or filtering ', error);
        throw error;
    }
}


async function prepareDataForPdf(rowData) {  // Add this function
    // Assuming rowData is the selected row from the Google Sheet
    return {
        date: rowData[0],
        firstName: rowData[1],
        lastName: rowData[2],
        email: rowData[3],
        contact: rowData[4],
        mcgiChurchMember: rowData[5],
        religion: rowData[6],
        newReturning: rowData[7],
        address: rowData[8],
        gender: rowData[9],
        qrCode: rowData[15],
        // ... any other data you need for the PDF
    };
}


module.exports = {fetchAndFilterData, prepareDataForPdf}; // Export both functions