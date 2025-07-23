import { NextResponse } from 'next/server';
import { scanResume } from '@/lib/gemini';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const yearsOfExperience = Number(formData.get('yearsOfExperience'));

    // Validate inputs
    if (!resumeFile || !jobDescription || isNaN(yearsOfExperience)) {
      return NextResponse.json(
        { error: 'Missing or invalid resume file, job description, or years of experience' },
        { status: 400 }
      );
    }

    if (!(resumeFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid resume file format' }, { status: 400 });
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    const report = await scanResume(resumeText, jobDescription, yearsOfExperience);

    return NextResponse.json({ ...report, resumeText });
  } catch (error: any) {
    console.error('Error in scan-resume API:', error);
    return NextResponse.json(
      { error: 'Failed to scan resume', details: error.message },
      { status: 500 }
    );
  }
}


