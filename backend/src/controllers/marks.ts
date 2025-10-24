import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import { ok, fail } from '../utils/response';
import { calculateGrade } from '../utils/grade';

const prisma = new PrismaClient();

const markSchema = z.object({
  student_id: z.number(),
  subject_id: z.number(),
  assessment_id: z.number(),
  score: z.number().min(0).max(100),
  comment: z.string().optional(),
});

const upload = multer({ dest: 'uploads/temp/' });

export async function getMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const { class_id, subject_id, assessment_id } = req.query;
    const where: any = {};
    if (class_id) where.student = { class_id: Number(class_id) };
    if (subject_id) where.subject_id = Number(subject_id);
    if (assessment_id) where.assessment_id = Number(assessment_id);

    const marks = await prisma.mark.findMany({
      where,
      include: { student: true, subject: true, assessment: true },
    });
    return res.json(ok(marks));
  } catch (error) {
    next(error);
  }
}

export async function createMark(req: Request, res: Response, next: NextFunction) {
  try {
    const data = markSchema.parse(req.body);
    const grade = calculateGrade(data.score);
    const mark = await prisma.mark.create({
      data: { ...data, grade },
      include: { student: true, subject: true, assessment: true },
    });
    return res.status(201).json(ok(mark));
  } catch (error) {
    next(error);
  }
}

export async function bulkCreateMarks(req: Request, res: Response, next: NextFunction) {
  try {
    const marksData = z.array(markSchema).parse(req.body);
    const marks = [];
    for (const data of marksData) {
      const grade = calculateGrade(data.score);
      const mark = await prisma.mark.create({
        data: { ...data, grade },
        include: { student: true, subject: true, assessment: true },
      });
      marks.push(mark);
    }
    return res.status(201).json(ok(marks));
  } catch (error) {
    next(error);
  }
}

export async function updateMark(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = markSchema.partial().parse(req.body);
    const updateData: any = { ...data };
    if (data.score !== undefined) updateData.grade = calculateGrade(data.score);
    const mark = await prisma.mark.update({
      where: { mark_id: Number(id) },
      data: updateData,
      include: { student: true, subject: true, assessment: true },
    });
    return res.json(ok(mark));
  } catch (error) {
    next(error);
  }
}

export const importMarks = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json(fail('No file uploaded'));

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const errors: any[] = [];
      const successes: any[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        try {
          const admission_no = row.admission_no || row.AdmissionNo;
          const subject_code = row.subject_code || row.SubjectCode || row.Subject;
          const assessment_name = row.assessment_name || row.AssessmentName;
          const score = row.score || row.Score;
          const term = row.term || row.Term;
          const year = row.year || row.Year;

          if (!admission_no || !subject_code || !assessment_name || score === undefined) {
            throw new Error('Missing required fields');
          }

          const student = await prisma.student.findUnique({ where: { admission_no } });
          if (!student) throw new Error('Student not found');

          const subject = await prisma.subject.findFirst({ where: { code: subject_code } });
          if (!subject) throw new Error('Subject not found');

          const assessment = await prisma.assessment.findFirst({
            where: { name: assessment_name, term, class_id: student.class_id },
          });
          if (!assessment) throw new Error('Assessment not found');

          const grade = calculateGrade(Number(score));
          const mark = await prisma.mark.create({
            data: {
              student_id: student.student_id,
              subject_id: subject.subject_id,
              assessment_id: assessment.assessment_id,
              score: Number(score),
              grade,
            },
          });
          successes.push(mark);
        } catch (err: any) {
          errors.push({ row: i + 2, error: err.message });
        }
      }

      fs.unlinkSync(req.file.path);

      return res.json(ok({ successes: successes.length, errors }, { details: { successes, errors } }));
    } catch (error) {
      next(error);
    }
  },
];
