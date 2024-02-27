import axios from "axios";
import FormData from 'form-data';

export async function uploadImageToImgBB(imageUrl: string, key: string, logger: any) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const formData = new FormData();
    formData.append('image', base64Image);

    const uploadResponse = await axios({
      method: 'post',
      url: `https://api.imgbb.com/1/upload`,
      params: {
        key: key,
        expiration: 10 * 60 * 1000
      },
      data: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    return uploadResponse.data
  } catch (error) {
    logger.error(error)
  }
}