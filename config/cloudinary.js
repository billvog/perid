const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'perid-tk', 
    api_key: '646539937837897', 
    api_secret: 'GrTcW-dIeON290iswpknvIR-dUU' 
});

module.exports = cloudinary;