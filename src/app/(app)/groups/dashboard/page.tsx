"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Trophy, Plus, MapPin, ChevronRight, Search, 
  Shield, Info, CheckCircle2, X, Activity, TrendingUp, 
  Star, Clock, Trash2, Edit, UserPlus, Check, MessageSquare, RotateCcw, LogOut, User
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PR {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  status: string;
  createdAt: string;
  user: { name: string; profileImage?: string };
  endorsements: any[];
}

interface GroupMember {
  role: string;
  user: { id: string; name: string; email: string; profileImage?: string };
}

interface Group {
  id: string;
  name: string;
  description: string;
  gymLocation: string;
  rules: string;
  minimumRequirements: string;
  maxMembers: number;
  privacyType: string;
  leader: { name: string };
  members: GroupMember[];
  prs: PR[];
}

export default function GroupDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ group: Group; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "prs" | "admin" | "requests">("dashboard");
  
  // PR Submission Form
  const [prForm, setPrForm] = useState({ exerciseName: "", weight: "", reps: "" });
  const [submittingPr, setSubmittingPr] = useState(false);

  // Group Admin Forms
  const [editForm, setEditForm] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
    isLoading: boolean;
    buttonText: string;
    isDanger?: boolean;
  }>({
    show: false,
    title: "",
    message: "",
    action: () => {},
    isLoading: false,
    buttonText: "Confirm",
  });

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  useEffect(() => {
    fetchMyGroup();
  }, []);

  const fetchMyGroup = async () => {
    try {
      const res = await fetch("/api/groups/my-group");
      const json = await res.json();
      if (json.group) {
        setData(json);
        setEditForm(json.group);
        if (json.role === 'LEADER') {
          fetchRequests(json.group.id);
        }
      }
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/requests`);
      const json = await res.json();
      setPendingRequests(json.requests || []);
    } catch {}
  };

  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPr(true);
    try {
      const res = await fetch("/api/groups/prs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prForm)
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error);
        return;
      }
      toast.success("PR submitted! Wait for endorsements.");
      setPrForm({ exerciseName: "", weight: "", reps: "" });
      fetchMyGroup();
    } catch {
      toast.error("Failed to submit PR");
    } finally {
      setSubmittingPr(false);
    }
  };

  const endorsePR = async (prId: string) => {
    try {
      const res = await fetch(`/api/groups/prs/${prId}/endorse`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error);
        return;
      }
      toast.success("PR endorsed!");
      fetchMyGroup();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleRequest = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`/api/groups/${data?.group.id}/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status })
      });
      if (res.ok) {
        toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
        fetchRequests(data!.group.id);
        fetchMyGroup();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/groups/${data?.group.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success("Group info updated!");
        fetchMyGroup();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteGroup = async () => {
    setConfirmAction(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/groups/${data?.group.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Group deleted");
        router.push("/groups");
        return;
      }
      toast.error("Failed to delete group");
    } catch {
      toast.error("Deletion failed");
    } finally {
      setConfirmAction(prev => ({ ...prev, isLoading: false, show: false }));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setConfirmAction(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/groups/${data?.group.id}/members/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Member removed");
        fetchMyGroup();
      } else {
        const json = await res.json();
        toast.error(json.error);
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setConfirmAction(prev => ({ ...prev, isLoading: false, show: false }));
    }
  };

  const handleLeaveGroup = async () => {
    setConfirmAction(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/groups/${data?.group.id}/leave`, { method: "POST" });
      if (res.ok) {
        toast.success("You have left the group");
        router.push("/groups");
        return;
      }
      const json = await res.json();
      toast.error(json.error || "Failed to leave group");
    } catch {
      toast.error("Action failed");
    } finally {
      setConfirmAction(prev => ({ ...prev, isLoading: false, show: false }));
    }
  };

  const triggerDeleteConfirm = () => {
    setConfirmAction({
      show: true,
      title: "DELETE GROUP?",
      message: "This action is permanent and will remove all members and PR history forever.",
      action: handleDeleteGroup,
      isLoading: false,
      buttonText: "Delete Forever",
      isDanger: true
    });
  };

  const triggerLeaveConfirm = () => {
    setConfirmAction({
      show: true,
      title: "LEAVE GROUP?",
      message: "Are you sure you want to leave this group? You will lose access to the team dashboard and PR feed.",
      action: handleLeaveGroup,
      isLoading: false,
      buttonText: "Leave Group",
      isDanger: true
    });
  };

  const triggerRemoveMemberConfirm = (member: any) => {
    setConfirmAction({
      show: true,
      title: "REMOVE MEMBER?",
      message: `Are you sure you want to remove ${member.user.name} from the group?`,
      action: () => handleRemoveMember(member.user.id),
      isLoading: false,
      buttonText: "Remove Member",
      isDanger: true
    });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;

  // CASE 1: NOT IN A GROUP
  if (!data) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <div className="glass-card" style={{ padding: "64px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🏢</div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>NOT IN A GROUP</h1>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>
            You haven&apos;t joined any fitness group yet. Groups are the best way to track performance and stay accountable with others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/groups">
              <button className="btn-primary" style={{ width: "100%" }}>Browse Groups</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { group, role } = data;
  const isLeader = role === 'LEADER';

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="glass-card mb-8" style={{ padding: "24px" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div style={{ 
               width: 52, height: 52, borderRadius: "12px", 
               background: "var(--color-accent)", display: "flex", 
               alignItems: "center", justifyContent: "center", color: "white" 
             }}>
               <User size={28} />
             </div>
             <div>
               <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700 }}>{group.name}</h1>
               <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                 <span className="badge badge-red" style={{ padding: "2px 8px", fontSize: "10px" }}>{role}</span>
                 <span>•</span>
                 <span className="flex items-center gap-1"><User size={12} /> {group.leader.name}</span>
               </div>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline" onClick={() => router.push(`/groups/${group.id}`)} style={{ fontSize: "12px", padding: "8px 16px" }}>View Group Info</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[rgba(255,255,255,0.03)] p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
         <div className="flex gap-1 min-w-max">
           <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'} style={{ border: "none", padding: "8px 16px", fontSize: "12px" }}>Dashboard</button>
           <button onClick={() => setActiveTab('prs')} className={activeTab === 'prs' ? 'btn-primary' : 'btn-outline'} style={{ border: "none", padding: "8px 16px", fontSize: "12px" }}>PR Feed</button>
           {isLeader && (
             <>
              <button onClick={() => setActiveTab('admin')} className={activeTab === 'admin' ? 'btn-primary' : 'btn-outline'} style={{ border: "none", padding: "8px 16px", fontSize: "12px" }}>Settings</button>
              <button onClick={() => setActiveTab('requests')} className={activeTab === 'requests' ? 'btn-primary' : 'btn-outline'} style={{ border: "none", padding: "8px 16px", fontSize: "12px", position: "relative" }}>
                Requests
                {pendingRequests.length > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "var(--color-accent)", borderRadius: "50%" }} />}
              </button>
             </>
           )}
         </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: Stats & Feed */}
          <div className="md:col-span-2 flex flex-col gap-8">
            {/* PR Submission */}
            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--color-text-secondary)" }}>ADD NEW PERSONAL RECORD</h2>
              <form onSubmit={handlePrSubmit} className="glass-card" style={{ padding: "24px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Exercise</label>
                    <input required className="form-input" placeholder="Deadlift" value={prForm.exerciseName} onChange={e => setPrForm({...prForm, exerciseName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Weight (kg)</label>
                    <input required type="number" step="0.5" className="form-input" placeholder="100" value={prForm.weight} onChange={e => setPrForm({...prForm, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Reps</label>
                    <input required type="number" className="form-input" placeholder="1" value={prForm.reps} onChange={e => setPrForm({...prForm, reps: e.target.value})} />
                  </div>
                </div>

                {group.members.length < 2 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <Info size={16} className="text-accent shrink-0 mt-0.5" />
                    <p style={{ fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                      <strong className="text-accent">Accountability Required:</strong> Your group needs at least 2 members to register PRs. Invite teammates or wait for join requests to be approved.
                    </p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={submittingPr || group.members.length < 2} 
                  className="btn-primary mt-4 w-full" 
                  style={{ 
                    padding: "12px",
                    opacity: group.members.length < 2 ? 0.5 : 1,
                    cursor: group.members.length < 2 ? "not-allowed" : "pointer"
                  }}
                >
                  {submittingPr ? "Submitting..." : "Submit for Verification"}
                </button>
                <div className="mt-4 p-4 bg-[rgba(230,57,71,0.05)] border border-[rgba(230,57,71,0.1)] rounded-lg">
                  <h4 className="text-[10px] uppercase font-bold text-accent mb-2 flex items-center gap-2">
                    <Info size={12} /> PR Guidelines
                  </h4>
                  <ul className="text-[11px] text-muted space-y-1 list-disc pl-4">
                    <li>Always include the weight of the barbell (e.g. 20kg).</li>
                    <li>Weights should be in kilograms (kg).</li>
                    <li>Only submit verified lifts (full range of motion).</li>
                    <li>Endorsements are required for your PR to show on the leaderboard.</li>
                  </ul>
                </div>
              </form>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card" style={{ padding: "20px" }}>
                 <div className="flex items-center gap-3 mb-4">
                   <Trophy size={20} color="var(--color-accent)" />
                   <span style={{ fontSize: "13px", fontWeight: 700 }}>YOUR STATS</span>
                 </div>
                 <div className="text-2xl sm:text-3xl font-bold mb-1">{group.prs.filter(p => p.user.name === user?.name && p.status === 'VERIFIED').length}</div>
                 <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Verified PRS</div>
              </div>
              <div className="glass-card" style={{ padding: "20px" }}>
                 <div className="flex items-center gap-3 mb-4">
                   <Activity size={20} color="white" />
                   <span style={{ fontSize: "13px", fontWeight: 700 }}>GROUP TOTAL</span>
                 </div>
                 <div className="text-2xl sm:text-3xl font-bold mb-1">{group.prs.filter(p => p.status === 'VERIFIED').length}</div>
                 <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Verified PRS</div>
              </div>
            </div>

            {/* Leave Group Option for non-leaders */}
            {!isLeader && (
              <div className="mt-4 p-4 glass-card border-[rgba(230,57,70,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>LEAVE GROUP</h4>
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Quit the group and stop tracking PRs with this team.</p>
                </div>
                <button 
                  onClick={triggerLeaveConfirm}
                  className="btn-outline w-full sm:w-auto text-red-500 hover:bg-red-500/10" 
                  style={{ border: "1px solid rgba(230,57,70,0.2)", color: "var(--color-accent)", fontSize: "12px", padding: "8px 16px" }}
                >
                  <LogOut size={14} className="inline mr-2" />
                  Leave Group
                </button>
              </div>
            )}
          </div>

          {/* Members Sidebar */}
          <div className="flex flex-col gap-6">
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>TEAM MEMBERS</h2>
            <div className="glass-card" style={{ padding: "16px" }}>
              {group.members.map(m => (
                <div key={m.user.id} className="flex items-center gap-3 p-3 rounded-lg border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <div style={{ 
                    width: 32, height: 32, borderRadius: "50%", 
                    background: m.user.profileImage ? `url(${m.user.profileImage})` : (m.role === 'LEADER' ? 'var(--color-accent)' : '#333'), 
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white" 
                  }}>
                    {!m.user.profileImage && <User size={16} />}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{m.user.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{m.role}</div>
                  </div>
                  {m.role === 'LEADER' && <Crown size={12} color="var(--color-accent)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prs' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>LATEST PR FEED</h2>
            <button 
              onClick={() => fetchMyGroup()} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
              title="Refresh PR Feed"
            >
              <RotateCcw size={18} />
            </button>
          </div>
           {group.prs.length === 0 ? (
             <div className="glass-card text-center py-10">No PRs yet. Be the first to submit one!</div>
           ) : (
             group.prs.map(pr => {
               const isOwn = pr.user.name === user?.name;
               const hasEndorsed = pr.endorsements.some(e => e.endorsedByUserId === user?.id);
               const threshold = Math.ceil(group.members.length / 2);
               
               return (
                 <div key={pr.id} className="glass-card flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ padding: "20px", borderLeft: pr.status === 'VERIFIED' ? '4px solid #4CAF50' : '4px solid var(--color-accent)' }}>
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span style={{ fontWeight: 700 }}>{pr.user.name}</span>
                       <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>hit a new PR!</span>
                       {pr.status === 'VERIFIED' && <span className="badge badge-red" style={{ background: '#4CAF50', color: 'white' }}>VERIFIED</span>}
                     </div>
                     <div style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>
                       {pr.exerciseName}: {pr.weight}kg x {pr.reps}
                     </div>
                     <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                       {formatDistanceToNow(new Date(pr.createdAt), { addSuffix: true })}
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <TrendingUp size={14} /> 
                        <span>{pr.endorsements.length} / {threshold} Endorsements</span>
                      </div>
                      {!isOwn && pr.status === 'PENDING' && !hasEndorsed && (
                        <button onClick={() => endorsePR(pr.id)} className="btn-primary flex items-center gap-2" style={{ padding: "6px 16px", fontSize: "12px" }}>
                          <Check size={14} /> Endorse PR
                        </button>
                      )}
                      {hasEndorsed && <div style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600 }}>✓ Endorsed</div>}
                   </div>
                 </div>
               );
             })
           )}
        </div>
      )}

      {activeTab === 'admin' && isLeader && (
        <div className="flex flex-col gap-6">
           <section className="glass-card" style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>EDIT GROUP DETAILS</h2>
              <form onSubmit={handleEditGroup} className="flex flex-col gap-4">
                 <div>
                    <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Group Name</label>
                    <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Group Name" />
                 </div>
                 <div>
                    <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Description</label>
                    <textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Gym Location</label>
                      <input className="form-input" value={editForm.gymLocation} onChange={e => setEditForm({...editForm, gymLocation: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] uppercase font-bold text-muted mb-2 block">Max Members</label>
                      <input type="number" className="form-input" value={editForm.maxMembers} onChange={e => setEditForm({...editForm, maxMembers: e.target.value})} />
                   </div>
                 </div>
                 <button type="submit" className="btn-primary w-full" style={{ padding: "12px" }}>Save Group Info</button>
              </form>
           </section>

           <section className="glass-card" style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>MANAGE MEMBERS</h2>
              <div className="flex flex-col gap-3">
                 {group.members.map(m => (
                   <div key={m.user.id} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div style={{ 
                          width: 32, height: 32, borderRadius: "50%", 
                          background: m.user.profileImage ? `url(${m.user.profileImage})` : "#333", 
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "white" 
                        }}>
                          {!m.user.profileImage && m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600 }}>{m.user.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{m.role}</div>
                        </div>
                      </div>
                      {m.role !== 'LEADER' && (
                        <button onClick={() => triggerRemoveMemberConfirm(m)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                           <Trash2 size={16} />
                        </button>
                      )}
                   </div>
                 ))}
              </div>
           </section>

           <section className="glass-card border-accent-subtle" style={{ padding: "24px", border: "1px solid rgba(230,57,70,0.2)" }}>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "12px", color: "var(--color-accent)" }}>DANGER ZONE</h2>
              <p style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>Deleting a group is permanent and will remove all members and PR history.</p>
              <button onClick={triggerDeleteConfirm} className="btn-outline border-none text-red-500 bg-red-500/10 hover:bg-red-500/20" style={{ color: "var(--color-accent)" }}>
                Delete Group Forever
              </button>
           </section>
        </div>
      )}

      {activeTab === 'requests' && isLeader && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, color: "var(--color-text-secondary)" }}>PENDING REQUESTS</h2>
            <button 
              onClick={() => fetchRequests(group.id)} 
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted hover:text-white"
              title="Refresh Requests"
            >
              <RotateCcw size={18} />
            </button>
          </div>
           {pendingRequests.length === 0 ? (
             <div className="glass-card text-center py-10 text-muted">No pending requests</div>
           ) : (
               pendingRequests.map(req => (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="glass-card flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-accent/40 transition-all" 
                  style={{ padding: "20px" }}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div style={{ 
                      width: 42, height: 42, borderRadius: "50%", 
                      background: req.user.profileImage ? `url(${req.user.profileImage})` : "var(--color-accent)", 
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "white" 
                    }}>
                       {!req.user.profileImage && <User size={20} />}
                    </div>
                    <div>
                       <div style={{ fontWeight: 600 }}>{req.user.name}</div>
                       <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Level: {req.user.fitnessLevel}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => handleRequest(req.id, 'APPROVED')} className="btn-primary flex-1 sm:flex-none" style={{ padding: "10px 20px", fontSize: "12px", background: "var(--color-accent)" }}>Approve</button>
                     <button onClick={() => handleRequest(req.id, 'REJECTED')} className="btn-outline flex-1 sm:flex-none" style={{ padding: "10px 20px", fontSize: "12px" }}>Reject</button>
                  </div>
                </div>
              ))
           )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction.show && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          padding: "20px"
        }}>
          <div className="glass-card w-full max-w-[400px] text-center" style={{ padding: "32px", border: `1px solid ${confirmAction.isDanger ? 'rgba(230,57,70,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>{confirmAction.title}</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
              {confirmAction.message}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmAction.action} 
                className={confirmAction.isDanger ? "btn-primary" : "btn-primary"} 
                style={{ width: "100%", background: confirmAction.isDanger ? "var(--color-accent)" : undefined }}
                disabled={confirmAction.isLoading}
              >
                {confirmAction.isLoading ? "Please wait..." : confirmAction.buttonText}
              </button>
              <button 
                onClick={() => setConfirmAction(prev => ({ ...prev, show: false }))} 
                className="btn-outline" 
                style={{ width: "100%", border: "none" }}
                disabled={confirmAction.isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Profile Modal */}
      {selectedRequest && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          padding: "20px"
        }}>
          <div className="glass-card w-full max-w-[500px]" style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
                  {selectedRequest.user.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700 }}>{selectedRequest.user.name.toUpperCase()}</h2>
                  <p className="text-accent text-xs font-bold tracking-widest">{selectedRequest.user.fitnessLevel} • {selectedRequest.user.age} Y/O</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-muted uppercase font-bold mb-1">Fitness Goal</p>
                <p className="text-sm font-semibold">{selectedRequest.user.fitnessGoal || "Not specified"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-muted uppercase font-bold mb-1">Verified PRs</p>
                <p className="text-sm font-semibold">{selectedRequest.user._count?.prs || 0} Records</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-muted uppercase font-bold mb-1">Education</p>
                <p className="text-sm font-semibold">{selectedRequest.user.course || "N/A"}, Year {selectedRequest.user.year || "N/A"}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-muted uppercase font-bold mb-1">Primary Gym</p>
                <p className="text-sm font-semibold">{selectedRequest.user.gymLocation || "N/A"}</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] text-muted uppercase font-bold mb-2">Member Bio</p>
              <p className="text-sm text-secondary leading-relaxed p-4 bg-white/5 rounded-xl italic">
                &quot;{selectedRequest.user.bio || "No bio provided yet."}&quot;
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  handleRequest(selectedRequest.id, 'APPROVED');
                  setSelectedRequest(null);
                }} 
                className="btn-primary flex-1"
                style={{ background: "var(--color-accent)" }}
              >
                Approve Member
              </button>
              <button 
                onClick={() => {
                  handleRequest(selectedRequest.id, 'REJECTED');
                  setSelectedRequest(null);
                }} 
                className="btn-outline flex-1"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Crown({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
