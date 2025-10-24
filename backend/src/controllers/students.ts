import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { ok, fail } from '../utils/response';
import { authenticate, authorize } from '../middlewares/auth';

const prisma = new PrismaClient();

const studentSchema = z.object({
  admission_no: z.string().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z.string().optional(),
  class_id: z.number().optional(),
  parent_contact: z.string().optional(),
  parent_email: z.string().email().optional(),
  address: z.string().optional(),
});

const upload = multer({ dest: 'uploads/temp/' });

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, class_id, name } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (class_id) where.class_id = Number(class_id);
    if (name) where.OR = [
      { first_name: { contains: name as string } },
      { last_name: { contains: name as string } },
    ];

    const students = await prisma.student.findMany({
      where,
      include: { class: true },
      skip,
      take: Number(limit),
    });

    const total = await prisma.student.count({ where });

    return res.json(ok(students, { total, page, limit }));
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = studentSchema.parse(req.body);
    const student = await prisma.student.create({ data, include: { class: true } });
    return res.status(201).json(ok(student));
  } catch (error) {
    next(error);
  }
}

export async function getStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { student_id: Number(id) },
      include: { class: true, marks: { include: { subject: true, assessment: true } } },
    });
    if (!student) return res.status(404).json(fail('Student not found'));
    return res.json(ok(student));
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = studentSchema.partial().parse(req.body);
    const student = await prisma.student.update({
      where: { student_id: Number(id) },
      data,
      include: { class: true },
    });
    return res.json(ok(student));
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.student.delete({ where: { student_id: Number(id) } });
    return res.json(ok({ message: 'Student deleted' }));
  } catch (error) {
    next(error);
  }
}

export const importStudents = [
  authenticate,
  authorize(['admin', 'teacher']),
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
          // Map columns (case insensitive)
          const admission_no = row.admission_no || row['Admission No'] || row['AdmNo'];
          const first_name = row.first_name || row.FirstName || row['First Name'];
          const last_name = row.last_name || row.LastName || row.Surname;
          const dob = row.dob || row.DOB;
          const gender = row.gender || row.Gender;
          const class_name = row.class_name || row.ClassName || row.Class;
          const parent_contact = row.parent_contact || row.ParentContact || row['Parent Phone'];
          const parent_email = row.parent_email || row.ParentEmail;

          // Validate
          if (!first_name) throw new Error('First name required');
          if (!class_name) throw new Error('Class required');

          // Find or create class
          let classRecord = await prisma.class.findFirst({ where: { name: class_name } });
          if (!classRecord) {
            classRecord = await prisma.class.create({ data: { name: class_name } });
          }

          const studentData = {
            admission_no: admission_no || undefined,
            first_name,
            last_name: last_name || undefined,
            gender: gender || undefined,
            dob: dob ? new Date(dob) : undefined,
            class_id: classRecord.class_id,
            parent_contact: parent_contact || undefined,
            parent_email: parent_email || undefined,
          };

          const student = await prisma.student.create({ data: studentData });
          successes.push(student);
        } catch (err: any) {
          errors.push({ row: i + 2, error: err.message });
        }
      }

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      return res.json(ok({ successes: successes.length, errors }, { details: { successes, errors } }));
    } catch (error) {
      next(error);
    }
  },
];
