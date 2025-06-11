import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Link } from 'react-router-dom';

const ProjectList = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', customer_id: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await apiFetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await apiFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: form }),
    });

    if (res.ok) {
      await fetchProjects();
      setForm({ name: '', description: '', customer_id: '' });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">プロジェクト一覧</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="プロジェクト名"
          required
          className="border p-2 mr-2"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="説明 (任意)"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          作成
        </button>
      </form>

      <ul>
        {projects.map((project) => (
          <li key={project.id} className="mb-2">
            <Link to={`/projects/${project.id}`} className="text-blue-600">
              {project.name}
            </Link>
            {project.customer && (
              <span className="ml-2 text-gray-500">
                ({project.customer.customer_code}：{project.customer.name})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
