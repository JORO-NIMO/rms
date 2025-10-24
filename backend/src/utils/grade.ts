// Ugandan Secondary School Grading System (based on UNEB)
export const UGANDAN_GRADE_SCALE = [
  { min: 90, grade: 'D1' }, // 90-100
  { min: 85, grade: 'D2' }, // 85-89
  { min: 80, grade: 'C3' }, // 80-84
  { min: 75, grade: 'C4' }, // 75-79
  { min: 70, grade: 'C5' }, // 70-74
  { min: 65, grade: 'C6' }, // 65-69
  { min: 60, grade: 'P7' }, // 60-64
  { min: 55, grade: 'P8' }, // 55-59
  { min: 0, grade: 'F9' },  // Below 55
];

export function calculateGrade(score: number, gradeScale = UGANDAN_GRADE_SCALE): string {
  for (const g of gradeScale) {
    if (score >= g.min) return g.grade;
  }
  return 'F9';
}
