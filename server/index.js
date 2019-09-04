const express = require('express');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');
const { db } = require('./db');
const { BUCKET_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = require('../secrets');
const app = express();
const PORT = 3000;

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY_ID,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3();

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type) => {
	const params = {
		ACL: 'public-read',
		Body: buffer,
		Bucket: BUCKET_ID,
		ContentType: type.mime,
		Key: `${name}.${type.ext}`
	};
	return s3.upload(params).promise();
};

//Post route to upload file
app.post('/test-upload', (request, response) => {
	const form = new multiparty.Form();
	form.parse(request, async (error, fields, files) => {
		if (error) throw new Error(error);
		try {
			const path1 = files.file[0].path;
			const buffer = fs.readFileSync(path1);
			const type = fileType(buffer);
			const timestamp = Date.now().toString();
			const fileName = `bucketFolder/${timestamp}-lg`;
			const data = await uploadFile(buffer, fileName, type);
			return response.status(200).send(data);
		} catch (err) {
			return response.status(400).send(err);
		}
	});
});

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

// For all GET requests that aren't to an API route,
// we will send the index.html!
app.get('/*', (req, res, next) => {
	res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Handle 404s
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handling endware
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send(err.message || 'Internal server error');
});

db.sync().then(() => {
	console.log('The database is synced!');
	app.listen(PORT, () =>
		console.log(`

      Listening on port ${PORT}

    `)
	);
});
