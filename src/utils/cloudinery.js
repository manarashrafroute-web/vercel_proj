import { v2 as cloudinary } from 'cloudinary';
import { cLOUD_NAME, cLOUD_API_KEY, CLOUD_API_SECRET } from '../config/config.service.js';

// Configuration
cloudinary.config({
    cloud_name: cLOUD_NAME,
    api_key: cLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary