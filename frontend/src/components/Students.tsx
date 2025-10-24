import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Student {
  student_id: number;
  admission_no?: string;
  first_name: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  class?: { name: string };
  parent_contact?: string;
  parent_email?: string;
  address?: string;
}

interface StudentsProps {
  token: string;
}

export default function Students({ token }: StudentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/v1/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      return result.success ? result.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Student>) => {
      const res = await fetch('/api/v1/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setFormData({});
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/students/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setFile(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleImport = () => {
    if (file) importMutation.mutate(file);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Students</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add Student
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
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

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Admission No"
              value={formData.admission_no || ''}
              onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="First Name"
              required
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Class ID"
              value={formData.class_id || ''}
              onChange={(e) => setFormData({ ...formData, class_id: Number(e.target.value) })}
              className="px-3 py-2 border rounded"
            />
          </div>
          <button type="submit" className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Save
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students?.map((student: Student) => (
              <tr key={student.student_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.admission_no}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.class?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
