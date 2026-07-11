import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { cloudinary } from '@/lib/cloudinary';
import { Readable } from 'stream';

export async function POST(request) {
  try {
    // 1. Authenticate — only EMPLOYEE or ADMIN can upload
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
    }

    // 2. Parse multipart form
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Uploaded file must be an image.' }, { status: 400 });
    }

    // 3. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload via stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'blog-builder-uploads',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      // Pipe the buffer into the upload stream
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });

    return NextResponse.json(
      {
        message: 'Image uploaded successfully.',
        url: uploadResult.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cloudinary upload API error:', error);
    return NextResponse.json(
      { message: 'Something went wrong during file upload.' },
      { status: 500 }
    );
  }
}
