import express from 'express';
import { json } from 'body-parser';
import { routes } from './routes'; // Assuming you have a routes file for handling routes

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use('/api', routes); // Prefixing routes with /api

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});