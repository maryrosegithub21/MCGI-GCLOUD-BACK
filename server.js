require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://mcgi-app-450700.uc.r.appspot.com'
}));

const port = process.env.PORT || 8080;
const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const range = 'Members!A:Z';
const apiKey = process.env.GEMINI_API_KEY;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Asynchronous Google Auth initialization
async function initializeGoogleAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    return await auth.getClient();
  } catch (error) {
    console.error("Error initializing Google Auth:", error);
    process.exit(1);
  }
}

// Initialize Google Auth and set up endpoints
initializeGoogleAuth().then(authClient => {
  // Login Endpoint
  app.post('/api/login', async (req, res) => {
    const { email, password, churchid } = req.body;
    console.log("Received login request:", { email, churchid });

    try {
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      if (!response.data || !response.data.values) {
        console.error("No data received from Google Sheets or no values present.");
        return res.status(500).json({ message: 'Error fetching data from Google Sheets' });
      }

      const rows = response.data.values;

      const user = rows.find(row => {
        const rowEmail = row[1];
        const rowPassword = row[2];
        const rowChurchId = row[0];

        const emailMatch = rowEmail === email;
        const passwordMatch = rowPassword === password;
        const churchIdMatch = rowChurchId === churchid;

        if (!emailMatch) console.log(`Email mismatch: expected ${email}, got ${rowEmail}`);
        if (!passwordMatch) console.log(`Password mismatch for ${email}`);
        if (!churchIdMatch) console.log(`Church ID mismatch: expected ${churchid}, got ${rowChurchId}`);

        return emailMatch && passwordMatch && churchIdMatch;
      });

      if (user) {
        console.log("Login successful for:", email);
        res.status(200).json({ message: 'Login successful', user });
      } else {
        console.log("Login failed for:", email);
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error verifying login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Gemini Chatbot Configuration
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: "The Assistant Name is Servant. \nThe servant can only answer question related to members church of God International Organization.\nThe servant contact number is +64274380184.\nThe servant facebook is https://www.facebook.com/edwardochoa1998\nThe Location of the event is at 35 Acheron Drive, Riccarton, Christchurch 8041\nThe Facebook Page of the MCGI is https://www.facebook.com/MCGICaresOfficial\nFor other information need they may contact the provided information\nThe servant will stop responding when the question is not related to the Members Church Of God International and say \" Thanks be to God for your inquiries and please contact us for more information about the event, Feel Free to contact me at +64274380184.\nThe Feast of God or Brethren Day celebrates every April, July, October and December exact dates will be post 1 week before the event or you can reach our servant for more details +64274380184\n",
    tools: [{
      google_search_retrieval: {
        dynamic_retrieval_config: {
          mode: "MODE_DYNAMIC",
          dynamic_threshold: 0.3,
        },
      },
    }],
  });
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    stopSequences: [
      "when question is not about the MCGI organization",
    ],
    responseMimeType: "text/plain",
  };

  // Gemini Chatbot Endpoint
  app.post('/api/gemini-chat', async (req, res) => {
    let message = req.body.message;
    console.log("Message type before conversion:", typeof message);
    console.log("Message before conversion:", message);
    console.log("Message type after conversion:", typeof message);
    console.log("Message after conversion:", message);

    let retryCount = 0;
    const maxRetries = 3;
    let result;

    while (retryCount < maxRetries) {
      try {
        const chatSession = model.startChat({ generationConfig, history: [] });
        result = await chatSession.sendMessage(message);
        break;
      } catch (error) {
        if (error.status === 503 && error.statusText === 'Service Unavailable') {
          retryCount++;
          const delay = 2 ** retryCount * 1000;
          console.log(`Gemini API overloaded. Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return res.status(error.status || 500).json({ error: error.message || 'Failed to get Gemini chat response' });
        }
      }
    }

    if (result) {
      res.json({ response: result.response.text() });
    } else {
      res.status(503).json({ error: 'Gemini API overloaded. Please try again later.' });
    }
  });


  // generate PDF
app.post('/generate-pdf', async (req, res) => {
  try {
    const authClient = await auth.getClient(); // Ensure you have the auth client
    const { date, firstName, lastName, email, contact, mcgiChurchMember, religion, newReturning, address, gender, qrCode } = req.body;

    // Call the generatePDF function with the data
    const pdfBuffer = await generatePDF(authClient, {
      date,
      firstName,
      lastName,
      email,
      contact,
      mcgiChurchMember,
      religion,
      newReturning,
      address,
      gender,
      qrCode,
    });

    // Set the correct headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${lastName}_${firstName}_form.pdf"`);

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});


  app.get('/', (req, res) => {
    res.send('Hello from a minimal server!');
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}).catch(error => {
  console.error("Server startup error:", error);
  process.exit(1);
});