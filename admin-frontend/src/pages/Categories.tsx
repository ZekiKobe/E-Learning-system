import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', formData);
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Categories</h1>
          <p className="text-sm admin-text-muted mt-1">
            Organize courses into clear, searchable groups.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-sm hover:shadow-md"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="admin-card rounded-xl border admin-border-subtle p-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="font-bold mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm admin-text-muted mb-3">{category.description}</p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setCategoryToDelete(category.id)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 text-red-600 hover:bg-red-600/20"
                title="Delete category"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <rect x="5" y="6" width="14" height="14" rx="2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl admin-card border admin-border-subtle backdrop-blur p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold mb-4">Create Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent placeholder:text-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent placeholder:text-slate-400 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border admin-border-subtle text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={categoryToDelete !== null}
        title="Delete category?"
        description="Courses will remain, but they will lose this category assignment."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (categoryToDelete !== null) {
            handleDelete(categoryToDelete);
          }
          setCategoryToDelete(null);
        }}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
}

export default Categories;

