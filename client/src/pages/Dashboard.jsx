import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserGroups } from '../services/api';
import { Plus, Users, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await getUserGroups();
                setGroups(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8 px-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-display text-foreground">My Groups</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
                    </div>
                    <Link to="/" className="btn-primary rounded-xl px-4 py-2 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">New Group</span>
                    </Link>
                </div>

                {groups.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
                        <Users className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground">No groups yet</h3>
                        <p className="text-muted-foreground mb-6">Create or join a group to get started</p>
                        <Link to="/" className="btn-secondary">
                            Create a Group
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map((group) => (
                            <Link
                                key={group._id}
                                to={`/group/${group._id}`}
                                className="group glass p-6 rounded-2xl hover:bg-secondary/50 transition-all border border-transparent hover:border-border/50 block"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                        {group.name[0].toUpperCase()}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                    {group.name}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {group.members.length} members
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
