import React, {useEffect, useState } from 'react';
import axios from 'axios';
import '../src/GoogleSheets.module.css'
import styles from '../src/GoogleSheets.module.css';
import { generatePdf } from './GeneratePdf';

const GoogleSheets = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [churchID, setChurchID] = useState(''); // State for church ID
  const [isAuthorized, setIsAuthorized] = useState(false); // State to track authorization
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
  const RANGE = 'RAW FORM DATA!A2:T100'; // Adjust the range as needed
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); // Track 
  const [noDataFound, setNoDataFound] = useState(false); // New state for no data found message

  // useEffect(() => {
  //   if (!isAuthorized) {
  //     const enteredID = prompt('Please enter your Church ID:');
  //     setChurchID(enteredID);
  //   }
  // }, [isAuthorized]);


  useEffect(() => {
    const fetchData = async () => {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
      try {
        const response = await axios.get(url);
        const allData = response.data.values;
        // setData(response.data.values);

         // Check if the entered church ID exists in the data
        //  const idExists = response.data.values.some(row => row.includes(churchID));
        // Check if the entered church ID exists in the data
        const idExists = allData.some(row => row.includes(churchID));
         if (idExists) {
           setIsAuthorized(true);

            // Filter data to include only columns from "timestamp" to "delivered"
          const filteredColumns = allData.map(row => row.slice(0, 13)); // Adjust indices as needed
          setData(filteredColumns);

         } else {
           alert('Invalid Church ID. Please try again.');
          //  setIsAuthorized(false);
          setChurchID(''); // Reset church ID to prompt again
         }

      } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
      }
    };

    if (churchID) {
    fetchData();
    } else {
      const enteredID = prompt('Please enter your Church ID:');
      setChurchID(enteredID);
    }
  }, [API_KEY, SPREADSHEET_ID, RANGE, churchID]);

  const handleSearch = () => {
     // Check if the search query is empty or contains only whitespace
  if (!searchQuery.trim()) {
    alert('Please type in the Last Name or First name you are looking for?');
    return;
  }
    const query = searchQuery.toLowerCase();
    const filtered = data.filter(row => {
      const firstName = row[1].toLowerCase();
      const lastName = row[2].toLowerCase();
      return firstName.includes(query) || lastName.includes(query);
    });
    setFilteredData(filtered);
    setNoDataFound(filtered.length === 0); // Set noDataFound based on search results
  };

  const handleRowClick = (rowData, rowIndex) => {
    setSelectedRowData(rowData);
  setSelectedRowIndex(rowIndex); // Set the selected row index
  console.log('Row Data Clicked:', rowData);
  };

  // const createGoogleDocsDocument = async (rowData) => {
  //   try {
  //     const url = 'http://localhost:5000/updateDocument'; // Your Node.js server endpoint
  //     const data = {
  //       documentId: '1HzG41PncXWmnAZJ3D4ksoIvC7I41yzgpW25dBZpQWMo', // Existing document ID
  //       rowData: rowData
  //     };
  
  //     const response = await axios.post(url, data);
  //     console.log('Document updated successfully:', response.data);
  //     return response.data; // Return the response data
  //   } catch (error) {
  //     console.error('Error updating document in Google Docs:', error);
  //     throw error; // Rethrow the error to be handled by the caller
  //   }
  // };
  
  const updateGoogleSheet = async (rowIndex) => {
    const updateRange = `RAW FORM DATA!M${rowIndex + 2}`; // Assuming "Print" column is M
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${updateRange}?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    const body = {
      range: updateRange,
      majorDimension: "ROWS",
      values: [["Yes"]],
    };

    try {
      await axios.put(url, body);
      console.log('Google Sheet updated successfully.');
    } catch (error) {
      console.error('Error updating Google Sheet:', error);
    }
  };

  // Call the createGoogleDocsDocument function in handlePassToGoogleDocs
  const handlePassToGoogleDocs = () => {
    if (selectedRowData) {
      const lastName = selectedRowData[2]; // Assuming the last name is at index 2
      const confirmationMessage = `Are you sure you want to print the information of ${lastName}?`;
    // if (selectedRowData) {
      if (window.confirm(confirmationMessage)) {
      const rowDataToPass = {
        date: selectedRowData[0],
        firstName: selectedRowData[1],
        lastName: selectedRowData[2],
        email: selectedRowData[3],
        contact: selectedRowData[4],
        mcgiChurchMember: selectedRowData[5],
        religion: selectedRowData[6],
        newReturning: selectedRowData[7],
        address: selectedRowData[8],
        gender: selectedRowData[9],
        qrCode: selectedRowData[11],
       
      };

      generatePdf(rowDataToPass)
      .then(() => {
        alert('PDF generated successfully!');
        updateGoogleSheet(selectedRowIndex); // Update the Google Sheet
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        alert('An error occurred while generating the PDF. Please try again.');
      });
    }  
  } else {
    console.log('No row data selected.');
    alert('No data has been selected. Please select you want to print.');
  }
  
  //     createGoogleDocsDocument(rowDataToPass)
  //     .then((response) => {
  //       console.log('Document updated successfully. Response:', response);

  //       // Further actions based on the Google Docs integration
  //       // Example: Notify the user
  //       alert('Document updated successfully!');
        

  //       // Example: Log the event
  //       console.log('Event logged: Document updated with ID:', response.documentId);

  //       // Example: Update the UI
  //       setSelectedRowData(null);
  //       setSearchQuery('');
  //       setFilteredData([]);
  //     })
  //     .catch((error) => {
  //       console.error('Error creating document in Google Docs:', error);

  //       // Example: Notify the user of the error
  //       alert('An error occurred while updating the document. Please try again.');
  //     });
  // } else {
  //   console.log('No row data selected.');
  // }
};
  
  
 
  return (
    <div>
        {isAuthorized ? (
        <>
      <h1>Members Church Of God Feast Guest Information</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by First Name or Last Name"
      />
      <button onClick={handleSearch}>Search</button>
      {noDataFound && <h1>No Data Found</h1>} {/* Display message if no data found */}
      <table className={styles['data-table']}>
        <thead>
          <tr>
            {data[0] && data[0].map((header, index) => <th key={index}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {(filteredData.length > 0 ? filteredData : data.slice(1)).map((row, rowIndex) => (
            <tr
            key={rowIndex}
            onClick={() => handleRowClick(row, rowIndex)}
            className={selectedRowIndex === rowIndex ? 'selected-row' : ''}
          >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
          <button className={styles['print-button']} onClick={handlePassToGoogleDocs}>Print Data</button>
    </>
        ) : (
          <h1>Please enter a valid Church ID to access the data.</h1>
        ) }
    </div>
  );
};

export default GoogleSheets;
