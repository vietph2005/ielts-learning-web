import { useEffect, useState } from "react";
import { customFetch } from "@/components/sections/customFetch";
import React from "react";

interface ManageUsersTableProps {
    role: 'student' | 'teacher' | 'manager';
}

interface User {
    email: string;
    role: string;
    originalEmail?: string;
}
const API_URL = import.meta.env.VITE_API_URL;

export default function ManageUsersTable({ role }: ManageUsersTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await customFetch(`${API_URL}/getuser/${role}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users: HTTP status', response.status);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserField = <K extends keyof User>(key: K, value: User[K]) => {
        setSelectedUser(prev => prev ? { ...prev, [key]: value } : prev);
    };

    useEffect(() => {
        fetchUsers();
    }, [role]);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Manage {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    style={{ padding: '6px 8px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflowX: 'auto', padding: '10px', backgroundColor: '#fafafa' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Update Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users
                            .filter(user => user.email.toLowerCase().includes(searchEmail.toLowerCase()))
                            .map(user => (
                                <tr key={user.email} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={tdStyle}>{user.email}</td>
                                    <td style={tdStyle}>{user.role}</td>
                                    <td style={tdStyle}>
                                        <button
                                            style={actionButtonStyle}
                                            onClick={() => {
                                                setSelectedUser({ ...user, originalEmail: user.email });
                                                setShowForm(true);
                                            }}
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && selectedUser && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <h3>Update Role</h3>

                        {renderSelect("Role", selectedUser.role, val => updateUserField("role", val), ['student', 'teacher', 'manager'])}

                        <div style={{ marginTop: '10px' }}>
                            <button
                                onClick={async () => {
                                    const res = await customFetch(`${API_URL}/getuser/updateuser`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            email: selectedUser?.email,
                                            role: selectedUser?.role
                                        })
                                    });

                                    if (res.ok) {
                                        alert('User role updated successfully!');
                                        setShowForm(false);
                                        fetchUsers();
                                    } else {
                                        alert('Failed to update user role');
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const thStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '2px solid #ddd', fontWeight: 'bold', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '8px 12px', whiteSpace: 'nowrap' };
const actionButtonStyle: React.CSSProperties = { padding: '4px 8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContent: React.CSSProperties = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px' };

function renderSelect(label: string, value: string, onChange: (val: string) => void, options: string[]) {
    return (
        <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}
