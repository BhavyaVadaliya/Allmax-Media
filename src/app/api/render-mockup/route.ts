import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `allmax-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  
  try {
    await fs.mkdir(tempDir, { recursive: true });

    const contentType = req.headers.get('content-type') || '';
    let videoBuffer: Buffer | null = null;
    let overlayBase64: string = '';
    let outputFilename = 'Allmax_Mockup_Video.mp4';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const videoFile = formData.get('videoFile') as File | null;
      const videoUrl = formData.get('videoUrl') as string | null;
      overlayBase64 = (formData.get('overlayPng') as string) || '';
      outputFilename = (formData.get('filename') as string) || outputFilename;

      if (videoFile && videoFile.size > 0) {
        const arrayBuffer = await videoFile.arrayBuffer();
        videoBuffer = Buffer.from(arrayBuffer);
      } else if (videoUrl) {
        if (videoUrl.startsWith('/samples/')) {
          // Local public sample
          const localPath = path.join(process.cwd(), 'public', videoUrl);
          videoBuffer = await fs.readFile(localPath);
        } else if (videoUrl.startsWith('http')) {
          const fetchRes = await fetch(videoUrl);
          if (!fetchRes.ok) throw new Error(`Failed to fetch video URL: ${fetchRes.statusText}`);
          const ab = await fetchRes.arrayBuffer();
          videoBuffer = Buffer.from(ab);
        }
      }
    } else {
      const body = await req.json();
      overlayBase64 = body.overlayPng || '';
      outputFilename = body.filename || outputFilename;
      const videoUrl = body.videoUrl;

      if (body.videoBase64) {
        videoBuffer = Buffer.from(body.videoBase64.replace(/^data:video\/\w+;base64,/, ''), 'base64');
      } else if (videoUrl && videoUrl.startsWith('/samples/')) {
        const localPath = path.join(process.cwd(), 'public', videoUrl);
        videoBuffer = await fs.readFile(localPath);
      }
    }

    if (!videoBuffer) {
      return NextResponse.json({ error: 'No video data provided' }, { status: 400 });
    }

    if (!overlayBase64) {
      return NextResponse.json({ error: 'No overlay graphic provided' }, { status: 400 });
    }

    // Write input video to disk
    const inputVideoPath = path.join(tempDir, 'input_video.mp4');
    await fs.writeFile(inputVideoPath, videoBuffer);

    // Write overlay PNG to disk
    const cleanOverlayBase64 = overlayBase64.replace(/^data:image\/\w+;base64,/, '');
    const overlayPath = path.join(tempDir, 'overlay.png');
    await fs.writeFile(overlayPath, Buffer.from(cleanOverlayBase64, 'base64'));

    // Output path
    const outputPath = path.join(tempDir, 'output.mp4');

    // Run ffmpeg overlay command
    // Filter scales video to 720:1280 (9:16 vertical) or preserves aspect ratio and overlays the transparent PNG
    const filterComplex = '[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg];[bg][1:v]overlay=0:0[outv]';

    const args = [
      '-y',
      '-i',
      inputVideoPath,
      '-i',
      overlayPath,
      '-filter_complex',
      filterComplex,
      '-map',
      '[outv]',
      '-map',
      '0:a?',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-shortest',
      outputPath,
    ];

    await execFileAsync('ffmpeg', args, { timeout: 30000 });

    // Read the rendered output
    const outputBuffer = await fs.readFile(outputPath);

    // Clean up temp directory in background
    fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${outputFilename}"`,
        'Content-Length': outputBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    console.error('Video render API error:', err);
    // Cleanup on error
    fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json(
      { error: err.message || 'Failed to render video with ffmpeg' },
      { status: 500 }
    );
  }
}
