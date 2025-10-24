import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ok, fail } from '../utils/response';

const prisma = new PrismaClient();

function generateStudentReportHTML(student: any, marks: any[]) {
  const schoolName = 'SRMS School'; // Placeholder
  const term = 'Term 1'; // Placeholder
  const year = '2025';

  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Student Report - ${student.first_name} ${student.last_name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .student-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .print-button { display: none; }
        @media print { .print-button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${schoolName}</h1>
        <h2>Student Report Card</h2>
        <p>Term: ${term} | Academic Year: ${year}</p>
      </div>
      <div class="student-info">
        <p><strong>Name:</strong> ${student.first_name} ${student.last_name || ''}</p>
        <p><strong>Admission No:</strong> ${student.admission_no || 'N/A'}</p>
        <p><strong>Class:</strong> ${student.class?.name || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Parent Contact:</strong> ${student.parent_contact || 'N/A'}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Assessment</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
  `;

  marks.forEach(mark => {
    html += `
      <tr>
        <td>${mark.subject.name}</td>
        <td>${mark.assessment.name}</td>
        <td>${mark.score}</td>
        <td>${mark.grade}</td>
        <td>${mark.comment || ''}</td>
      </tr>
    `;
  });

  const totalScore = marks.reduce((sum, m) => sum + m.score, 0);
  const average = marks.length ? (totalScore / marks.length).toFixed(2) : '0.00';

  html += `
        </tbody>
      </table>
      <div>
        <p><strong>Total Score:</strong> ${totalScore}</p>
        <p><strong>Average:</strong> ${average}%</p>
        <p><strong>Class Position:</strong> TBD</p>
      </div>
      <div style="margin-top: 40px;">
        <p><strong>Teacher Remarks:</strong> _______________________________</p>
        <p><strong>Headteacher Signature:</strong> _______________________________</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <button class="print-button" onclick="window.print()">Print Report</button>
    </body>
    </html>
  `;

  return html;
}

export async function getStudentReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { format = 'html' } = req.query;

    const student = await prisma.student.findUnique({
      where: { student_id: Number(id) },
      include: { class: true },
    });
    if (!student) return res.status(404).json(fail('Student not found'));

    const marks = await prisma.mark.findMany({
      where: { student_id: Number(id) },
      include: { subject: true, assessment: true },
    });

    if (format === 'html') {
      const html = generateStudentReportHTML(student, marks);
      return res.send(html);
    }

    return res.json(ok({ student, marks }));
  } catch (error) {
    next(error);
  }
}
