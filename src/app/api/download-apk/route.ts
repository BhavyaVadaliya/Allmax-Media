import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const apkPath = path.join(process.cwd(), 'public', 'AllmaxStudio.apk');

    if (!fs.existsSync(apkPath)) {
      return new NextResponse('APK file not found. Please run build-apk.ps1 first.', { status: 404 });
    }

    const apkBuffer = fs.readFileSync(apkPath);

    return new NextResponse(apkBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="AllmaxStudio.apk"',
        'Content-Length': apkBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return new NextResponse('Error reading APK file: ' + error.message, { status: 500 });
  }
}
