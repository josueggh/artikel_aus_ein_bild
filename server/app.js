const express 		= require("express");
const formidable 	= require('express-formidable');
const cors = require('cors')

/*Cloud Vision API && Cloud Translation API*/
const vision = require('@google-cloud/vision');
const {TranslationServiceClient} = require('@google-cloud/translate');

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.projectID || 'YOUR_GCP_ID';

const app = express();
app.use(formidable());
app.use(cors());

const translateFromImage = async (image , source = 'en', target = 'de')=>{
	const client = new vision.ImageAnnotatorClient();
	const translationClient = new TranslationServiceClient();

	const [result] = await client.labelDetection(image);
	const request = {
		parent: `projects/${PROJECT_ID}/locations/global`,
		contents: [`the ${result.labelAnnotations[0].description}`],
		mimeType: 'text/plain',
		sourceLanguageCode: source,
		targetLanguageCode: target,
	};

	const [response] = await translationClient.translateText(request);
	const text = response.translations[0].translatedText;
	const [article, substantive] = text.split(" ");
	return {article, substantive};
};

app.post('/translate', async (req,res)=>{
	const obj =await translateFromImage(req.files.data.path);
	console.log(obj);
	return res.status(200).json(obj);
})

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
