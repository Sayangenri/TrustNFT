import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { MongoClient } from 'mongodb';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3035;

// Serving static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'loginn.html'));
});

app.get('/c', (req, res) => {
    res.send("hi");
});

// MongoDB configuration
const url = 'mongodb://localhost:27017/';
const dbName = 'Renaissance';
function createImageFromForm(formDetails, privateKey) {
    return new Promise((resolve, reject) => {
        const canvasWidth = 400;
        const canvasHeight = 500; // Increased canvas height to accommodate the private key
        const borderWidth = 5; // Border width

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Set border color and draw border
        ctx.strokeStyle = 'black'; // Border color
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

        // Set colorful background for heading
        ctx.fillStyle = 'rgb(255, 204, 0)'; // Yellow color
        ctx.fillRect(borderWidth, borderWidth, canvasWidth - 2 * borderWidth, 70); // Increased height for heading

        // Set heading font style and color
        ctx.fillStyle = 'black'; // Black color for text
        ctx.font = 'bold 40px Arial'; // Larger and bold font size for heading
        ctx.textAlign = 'center'; // Centered text
        ctx.fillText('Trust NFT', canvasWidth / 2, 55 + borderWidth); // Centered heading

        // Set normal text font style and color
        ctx.font = '16px Arial'; // Normal font size for text
        ctx.textAlign = 'left'; // Left-aligned text

        // Set white background for form details
        ctx.fillStyle = 'white'; // White color
        ctx.fillRect(borderWidth, 70 + borderWidth, canvasWidth - 2 * borderWidth, canvasHeight - 70 - borderWidth); // Exclude the area covered by the heading

        // Draw form details on canvas
        ctx.fillStyle = 'black'; // Black color for text
        ctx.fillText(`User Name: ${formDetails.userName}`, 50 + borderWidth, 120 + borderWidth);
        ctx.fillText(`User Email: ${formDetails.userEmail}`, 50 + borderWidth, 150 + borderWidth);
        ctx.fillText(`Product Name: ${formDetails.productName}`, 50 + borderWidth, 180 + borderWidth);
        ctx.fillText(`Product Description: ${formDetails.productDetails}`, 50 + borderWidth, 210 + borderWidth);
        ctx.fillText(`Private Key: ${privateKey}`, 50 + borderWidth, 240 + borderWidth); // Adjust the Y position as needed

        const downloadDirectory = '/home/lapsay/Downloads';
        // Save canvas to PNG image
        const outPath = path.join(__dirname, '..', 'nft', `${privateKey}.png`); // Save with the name of the private key
        const out = fs.createWriteStream(outPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        // Create a write stream for the downloads directory
        const outPathDownload = path.join(downloadDirectory, `${privateKey}.png`);
        const outDownload = fs.createWriteStream(outPathDownload);
        stream.pipe(outDownload);
        out.on('finish', () => {
            resolve(outPath);
        });
    });
}



// Form submission
app.post('/submit', async (req, res) => {
    const { userName, userEmail, productName, productDetails } = req.body;
    const keyvalue = Math.floor(10000 + Math.random() * 90000);

    try {
        const formDetails = {
            userName: userName,
            userEmail: userEmail,
            productName: productName,
            productDetails: productDetails,
        };

        const imageUrl = await createImageFromForm(formDetails, keyvalue);
        console.log('Image created:', imageUrl);

        // Insert form details into database
        const client = new MongoClient(url);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('Product Details');
        await collection.insertOne({ keyvalue, userName, userEmail, productName, productDetails });
        await client.close();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while submitting the form.');
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
