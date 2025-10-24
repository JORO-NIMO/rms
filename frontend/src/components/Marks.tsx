import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Mark {
  mark_id: number;
  student_id: number;
  subject_id: number;
  assessment_id: number;
  score: number;
  grade: string;
  comment?: string;
  student: { first_name: string; last_name: string };
  subject: { name: string };
  assessment: { name: string };
}

interface MarksProps {
  token: string;
}

export default function Marks({ token }: MarksProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: marks, isLoading } = useQuery({
    queryKey: ['marks'],
    queryFn: async () => {
      const res = await fetch('/api/v1/marks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      return result.success ? result.data : [];
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/marks/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      setFile(null);
    },
  });

  const handleImport = () => {
    if (file) importMutation.mutate(file);
  };

  // Group marks by student and subject
  const groupedMarks: { [key: string]: Mark[] } = {};
  marks?.forEach((mark: Mark) => {
    const key = `${mark.student_id}-${mark.subject_id}`;
    if (!groupedMarks[key]) groupedMarks[key] = [];
    groupedMarks[key].push(mark);
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Marks</h2>
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="import-marks-file"
          />
          <label
            htmlFor="import-marks-file"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Import Excel
          </label>
          {file && (
            <button
              onClick={handleImport}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marks?.map((mark: Mark) => (
                <tr key={mark.mark_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mark.student.first_name} {mark.student.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.assessment.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
