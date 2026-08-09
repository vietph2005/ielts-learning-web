import { API_URL } from "@/config/api";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RoleType = "student" | "teacher" | "manager";

type User = {
    email: string;
    roles: string[];
};

export default function ManageRole({ role }: { role: RoleType }) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<RoleType | "">("");
    const [actionType, setActionType] = useState<"add" | "update" | "delete" | "">("");
    const [searchEmail, setSearchEmail] = useState<string>("");
    
    const loadUsers = () => {
        fetch(`${API_URL}/getuser/${role}`)
            .then(res => {
                if (!res.ok) throw new Error("response was not ok");
                return res.json();
            })
            .then(data => {
                console.log("Fetched users:", JSON.stringify(data, null, 2));
                setUsers(data);
            })
            .catch(err => console.error("Fetch error:", err));
    };

    const handleAddRole = async () => {
        if (!selectedUser || !newRole.trim()) return;

        if (selectedUser.roles.includes(newRole)) {
            alert("User already has this role!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/getuser/addrole`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: selectedUser.email,
                    roles: [...selectedUser.roles, newRole.trim()]
                })
            });

            if (!res.ok) throw new Error("Failed to add role");

            await loadUsers();
            resetForm();
        } catch (err) {
            console.error("Add role error:", err);
        }
    };

    const handleDeleteRole = async (email: string | undefined, roleToDelete: string) => {
        const user = users.find(user => user.email === email);
        if (!user) return;

        if (user.roles.length <= 1) {
            alert("Cannot delete the last role of a user.");
            return;
        }

        const updatedRoles = user.roles.filter(role => role !== roleToDelete);

        try {
            const res = await fetch(`${API_URL}/getuser/deleterole`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, roles: updatedRoles })
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            await loadUsers();
            resetForm();
        } catch (err) {
            alert("Delete role error: " + err);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole.trim()) return;

        try {
            const currentRoles = selectedUser.roles;
            const updatedRoles = currentRoles.includes(newRole)
                ? currentRoles.filter(role => role !== newRole)
                : [...currentRoles, newRole.trim()];

            const res = await fetch(`${API_URL}/getuser/updateuser`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: selectedUser.email,
                    roles: updatedRoles
                })
            });

            if (!res.ok) throw new Error("Failed to update role");

            await loadUsers();
            resetForm();
        } catch (err) {
            console.error("Update role error:", err);
        }
    };

    const resetForm = () => {
        setSelectedUser(null);
        setNewRole("");
        setActionType("");
    };

    useEffect(() => {
        loadUsers();
    }, [role]);

    // Lọc người dùng theo email
    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto py-2 px-4">
            <h1 className="text-3xl font-bold text-emerald-700 mb-2 text-center">User Management</h1>
            <p className="text-gray-500 text-center mb-8">Manage users and roles with professional tools</p>
            <Card className="mb-8 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Input
                        type="text"
                        value={searchEmail}
                        onChange={e => setSearchEmail(e.target.value)}
                        placeholder="Search by email..."
                        className="w-full border-black-200"
                    />
                </div>
                <div className="overflow-x-auto rounded-lg border border-emerald-100 bg-emerald-50 transition-all duration-500">
                    <table className="min-w-full divide-y divide-emerald-200">
                        <thead className="bg-emerald-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Roles</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-emerald-700 uppercase">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.email} className="border-b border-emerald-100 hover:bg-emerald-200/30 transition-colors">
                                <td className="px-4 py-2 text-sm text-gray-800">{user.email}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{user.roles.join(", ")}</td>
                                <td className="px-4 py-2 text-sm text-gray-800 flex gap-2">
                                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700" onClick={() => { setSelectedUser(user); setActionType("update"); }}>Update</Button>
                                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={() => { setSelectedUser(user); setActionType("add"); }}>Add</Button>
                                    <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => { setSelectedUser(user); setActionType("delete"); }}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* Modal for Add/Update/Delete Role */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-xl shadow-2xl border border-emerald-200 p-8 w-full max-w-md animate-fade-in-up relative">
                        <button
                            className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-700 transition-colors"
                            onClick={resetForm}
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold text-emerald-700 mb-4">
                            {actionType === "add" && "Add Role"}
                            {actionType === "update" && "Update Role"}
                            {actionType === "delete" && "Delete Role"}
                            <span className="text-gray-500 text-base font-normal ml-2">for: <span className="font-mono text-emerald-600">{selectedUser.email}</span></span>
                        </h3>
                        <div className="mb-4">
                            <label className="block text-emerald-700 mb-1">
                                {actionType === "delete" ? "Select role to delete:" : "New Role:"}
                            </label>
                            <select
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as RoleType)}
                                className="w-full border border-emerald-200 rounded px-3 py-2 focus:border-emerald-400 focus:outline-none"
                            >
                                <option value="">Select role</option>
                                {actionType === "delete"
                                    ? selectedUser.roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))
                                    : ["student", "teacher", "manager"]
                                        .filter(r => !selectedUser?.roles.includes(r))
                                        .map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-6">
                            {actionType === "update" && (
                                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200" onClick={handleUpdateRole}>Confirm Update</Button>
                            )}
                            {actionType === "add" && (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200" onClick={handleAddRole}>Confirm Add</Button>
                            )}
                            {actionType === "delete" && (
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-all duration-200" onClick={() => handleDeleteRole(selectedUser?.email, newRole as RoleType)}>Confirm Delete</Button>
                            )}
                            <Button variant="outline" className="w-full border-emerald-300 text-emerald-700 mt-2" onClick={resetForm}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
