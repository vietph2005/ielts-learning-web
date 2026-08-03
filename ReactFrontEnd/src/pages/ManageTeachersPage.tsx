import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil} from "lucide-react";

interface UserDTO {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  premium: boolean;
  birthDate: string;
  gender: string;
  phone: string;
  createdAt: string;
}

export default function ManageTeachersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserDTO | null>(null);
  const [editData, setEditData] = useState<Partial<UserDTO>>({});
  const [_loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/user/role/teacher`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // const handleDelete = async (email: string) => {
  //   if (!window.confirm("Are you sure you want to delete this user?")) return;
  //   await fetch(`${API_URL}/api/user/${email}`, { method: "DELETE" });
  //   fetchUsers();
  // };

  const handleEdit = (user: UserDTO) => {
    setEditing(user);
    setEditData(user);
  };

  const handleSave = async () => {
    if (!editing) return;
    await fetch(`${API_URL}/api/user/${editing.userName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    setEditing(null);
    setEditData({});
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="max-w-5xl mx-auto py-10 px-4 min-h-[80vh]">
        <h1 className="text-3xl font-bold text-emerald-700 mb-2 text-center">Manage Teachers</h1>
        <p className="text-gray-500 text-center mb-8">Manage all teachers in the system</p>
        <Card className="mb-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-80 border-emerald-200 focus:border-emerald-400"
            />
          </div>
          <div className="overflow-x-auto rounded-lg border border-emerald-100 bg-emerald-50 transition-all duration-500">
            <table className="min-w-full divide-y divide-emerald-200">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.userName} className="border-b border-emerald-100 hover:bg-emerald-200/30 transition-colors">
                    <td className="px-4 py-2 text-sm text-gray-800">{user.userName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{user.firstName} {user.lastName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{user.phone}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{user.createdAt}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 flex gap-2">
                      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700" onClick={() => handleEdit(user)}><Pencil className="w-4 h-4" /></Button>
                      {/* <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => handleDelete(user.userName)}><Trash2 className="w-4 h-4" /></Button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-8 w-full max-w-md animate-fade-in-up relative">
              <button
                className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-700 transition-colors"
                onClick={() => setEditing(null)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-emerald-700 mb-4">Edit Teacher</h3>
              <div className="mb-4">
                <label className="block text-emerald-700 mb-1">First Name</label>
                <Input value={editData.firstName || ""} onChange={e => setEditData(d => ({ ...d, firstName: e.target.value }))} />
              </div>
              <div className="mb-4">
                <label className="block text-emerald-700 mb-1">Last Name</label>
                <Input value={editData.lastName || ""} onChange={e => setEditData(d => ({ ...d, lastName: e.target.value }))} />
              </div>
              <div className="mb-4">
                <label className="block text-emerald-700 mb-1">Phone</label>
                <Input value={editData.phone || ""} onChange={e => setEditData(d => ({ ...d, phone: e.target.value }))} />
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200" onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </div>
  );
} 