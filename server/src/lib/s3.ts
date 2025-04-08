import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const BUCKET_NAME = process.env.BUCKET_NAME!;
export const BUCKET_REGION = process.env.BUCKET_REGION!;
const ACCESS_KEY = process.env.ACCESS_KEY!;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY!;

export const s3 = new S3Client({
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY,
	},
	region: BUCKET_REGION,
});

export async function getImageUrl(imageName: string, expiresIn = 3600): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: imageName,
	});

	return await getSignedUrl(s3, command, { expiresIn });
}

export async function postImage(imageName: string, file: Express.Multer.File) {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: imageName,
		Body: file.buffer,
		ContentType: file.mimetype
	})

	try {
		const result = await s3.send(command);
		return result;
	} catch (err) {
		throw new Error('Error uploading image to S3.')
	}
}
