# MCGI-BACK
 This is a fully responsive web application for Members Church Of God International, leveraging React.js for the front-end and Node.js for the back end. Robust authentication and authorization were implemented using OAuth. The application features a user-friendly interface designed to facilitate key functions such as membership management, event registration, and online giving. For content management and database storage, I integrate Google Suite (Docs, Sheets). CORS was utilized to handle cross-origin requests, ensuring secure communication between the front end and back end

This project is a React application that interacts with Google Sheets to display and manage data. It allows users to search, view, and generate PDFs from the data retrieved from a Google Sheet. The application also requires a valid Church ID for access.

## Features

- Fetch and display data from Google Sheets.
- Search functionality to filter data by first or last name.
- Generate PDFs from selected data rows.
- Update Google Sheets with a "Yes" in the "Print" column upon PDF generation.
- Authorization using Church ID.

## Prerequisites

- Node.js and npm installed on your machine.
- Google Cloud Platform account with the Google Sheets API enabled.
- A Google Sheets API key and a service account key file for OAuth 2.0 authentication.

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/google-sheets-app.git
   cd google-sheets-app

Install dependencies:
npm install


Environment Variables:
Create a .env file in the root directory with the following variables:
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_SPREADSHEET_ID=your_spreadsheet_id


Service Account Key:
Place your service account key file in the project directory and update the path in GoogleSheets.js:
const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/your/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


Usage
Start the development server:
npm start


Access the application:
Open your browser and navigate to http://localhost:3000.
Enter Church ID:
Upon loading, the application will prompt for a Church ID. Enter a valid ID to access the data.
Search and Generate PDF:
Use the search bar to filter data by first or last name.
Click on a row to select it, then click "Print Data" to generate a PDF and update the Google Sheet.
Deployment
Google Cloud Platform
Set Up Google Cloud Project:
Create a project in the Google Cloud Console.
Enable the Google App Engine API.
Deploy to App Engine:
Create an app.yaml file in the root directory:
runtime: nodejs16
env_variables:
  GOOGLE_API_TOKEN: your_google_api_token
handlers:
- url: /.*
  script: auto


Deploy using the Google Cloud SDK:
gcloud app deploy


Access the Deployed App:
Use gcloud app browse to open your deployed application.
License
This project is licensed under the MIT License.


### Notes

- Replace placeholders like `your_google_api_key`, `your_spreadsheet_id`, and `yourusername` with actual values.
- Adjust the deployment instructions if you choose a different cloud provider or deployment method.
- Expand sections as needed to include more detailed instructions or additional features.