require('dotenv').config();

const fsp = require('fs/promises');
const B2 = require('backblaze-b2');

const {
  APPLICATION_KEY_ID,
  APPLICATION_KEY,
  BUCKET_ID,
  BASE_URL_BACKBLAZE,

} = process.env;
const b2 = new B2({
  applicationKeyId: APPLICATION_KEY_ID, // ou accountId: 'accountId'
  applicationKey: APPLICATION_KEY, // ou masterApplicationKey
});

const unlinkAsync = fsp.unlink;

class FileController {
  async upload(req, res) {
    const { filename, path } = req.file;
    try {
      const fileData = await fsp.readFile(`uploads/${filename}`);
      await b2.authorize();
      const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
        bucketId: BUCKET_ID,
      });
      const { data } = await b2.uploadFile({
        uploadUrl,
        uploadAuthToken: authorizationToken,
        filename,
        data: fileData,
      });
      await unlinkAsync(path);

      return res.status(200).json({
        url: `${BASE_URL_BACKBLAZE}${data.fileName}`,
      });
    } catch (error) {
      // Lidar com o erro adequadamente
      console.error(error);
      return res.status(500).json({ error: 'Erro Interno do Servidor' });
    }
  }
}

module.exports = new FileController();
