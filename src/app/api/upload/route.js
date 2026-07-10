import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    // 1. Authenticate the user (only authors/admins can upload images)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
    }

    // 2. Parse request formData
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type is image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Uploaded file must be an image.' }, { status: 400 });
    }

    // 3. Convert file stream into Base64 URI for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // 4. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileUri,
        {
          folder: 'blog-builder-uploads',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
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
