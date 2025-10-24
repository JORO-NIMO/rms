import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Student {
  student_id: number;
  admission_no?: string;
  first_name: string;
  last_name?: string;
}

interface ReportsProps {
  token: string;
}

export default function Reports({ token }: ReportsProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      return result.success ? result.data : [];
    },
  });

  const handleViewReport = (studentId: number) => {
    setSelectedStudent(studentId);
    // Open in new tab or iframe
    window.open(`/api/v1/reports/student/${studentId}?format=html`, '_blank');
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students?.map((student: Student) => (
            <div key={student.student_id} className="border rounded p-4 bg-white shadow">
              <h4 className="font-medium">
                {student.first_name} {student.last_name}
              </h4>
              <p className="text-sm text-gray-600">Admission: {student.admission_no || 'N/A'}</p>
              <button
                onClick={() => handleViewReport(student.student_id)}
                className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
              >
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
