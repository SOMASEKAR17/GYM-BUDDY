"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Trophy, Plus, MapPin, ChevronRight, Search, 
  Shield, Info, CheckCircle2, X 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Group {
  id: string;
  name: string;
  description: string;
  leaderName?: string;
  memberCount: number;
  maxMembers: number;
  gymLocation: string;
  verifiedPRs?: number;
  performanceScore?: number;
  privacyType: string;
  minimumRequirements: string;
}

export default function GroupsPage() {
  const [leaderboard, setLeaderboard] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    gymLocation: "",
    minimumRequirements: "",
    rules: "",
    privacyType: "PUBLIC",
    maxMembers: "10"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lbRes, allRes] = await Promise.all([
        fetch("/api/groups?type=leaderboard"),
        fetch("/api/groups")
      ]);
      const lbData = await lbRes.json();
      const allData = await allRes.json();
      setLeaderboard(lbData.groups || []);
      setAllGroups(allData.groups || []);
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Group created! Redirecting to dashboard...");
      setShowCreateModal(false);
      fetchData();
      // In a real app, redirect to group dashboard
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
            GYM <span className="text-gradient">GROUPS</span>
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Join a group to stay accountable and track PRs together</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Create Group
        </button>
      </div>

      {/* Section 1: Leaderboard */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={20} color="var(--color-accent)" />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>TOP PERFORMING GROUPS</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaderboard.map((group, i) => (
            <div key={group.id} className="glass-card relative overflow-hidden" style={{ padding: "20px" }}>
               {/* Rank badge */}
               <div style={{
                 position: "absolute", top: 0, right: 0, 
                 padding: "4px 12px", background: "rgba(230,57,70,0.2)",
                 borderBottomLeftRadius: "12px", borderLeft: "1px solid rgba(230,57,70,0.3)",
                 borderBottom: "1px solid rgba(230,57,70,0.3)",
                 fontSize: "12px", fontWeight: 700, color: "var(--color-accent)"
               }}>
                 RANK #{i+1}
               </div>

               <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "4px", color: "white" }}>{group.name}</div>
               <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>Leader: {group.leaderName}</div>
               
               <div className="grid grid-cols-2 gap-4 mb-16 px-2 py-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-accent)" }}>{group.verifiedPRs}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Verified PRs</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{group.performanceScore}</div>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Perf. Score</div>
                  </div>
               </div>

               <Link href={`/groups/${group.id}`}>
                 <button className="w-full btn-outline" style={{ padding: "8px", fontSize: "13px" }}>View Details</button>
               </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Browse Groups */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Search size={20} color="var(--color-text-muted)" />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>BROWSE ALL GROUPS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allGroups.map(group => (
            <div key={group.id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4" style={{ padding: "16px" }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: "10px", 
                background: "rgba(255,255,255,0.05)", display: "flex", 
                alignItems: "center", justifyContent: "center", color: "var(--color-accent)",
                flexShrink: 0
              }}>
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div style={{ fontWeight: 600, fontSize: "15px" }}>{group.name}</div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{group.description.substring(0, 60)}...</div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Users size={12} /> {group.memberCount}/{group.maxMembers} members
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={12} /> {group.gymLocation}
                  </span>
                </div>
              </div>
              <Link href={`/groups/${group.id}`}>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>View</button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          padding: "20px"
        }}>
          <div className="glass-card w-full max-w-[500px] max-h-[90vh] overflow-y-auto" style={{ padding: "32px", border: "1px solid rgba(230,57,70,0.3)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700 }}>CREATE A <span className="text-gradient">NEW GROUP</span></h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", color: "var(--color-text-muted)" }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateGroup} className="flex flex-col gap-5">
              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Group Name</label>
                <input required className="form-input" placeholder="e.g. VIT Powerlifters" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Description / Motive</label>
                <textarea required className="form-input" rows={3} placeholder="What is the goal of this group?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Gym Location</label>
                  <input required className="form-input" placeholder="e.g. Fitty New" value={form.gymLocation} onChange={e => setForm({...form, gymLocation: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Max Members</label>
                  <input type="number" className="form-input" min={2} max={50} value={form.maxMembers} onChange={e => setForm({...form, maxMembers: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Minimum Requirements</label>
                <input required className="form-input" placeholder="e.g. 1 year experience, 100kg deadlift" value={form.minimumRequirements} onChange={e => setForm({...form, minimumRequirements: e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Rules</label>
                <textarea required className="form-input" rows={2} placeholder="No skipping days, respect others..." value={form.rules} onChange={e => setForm({...form, rules: e.target.value})} />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "var(--color-text-secondary)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>Privacy</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setForm({...form, privacyType: 'PUBLIC'})} className={form.privacyType === 'PUBLIC' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: "10px" }}>Public</button>
                  <button type="button" onClick={() => setForm({...form, privacyType: 'PRIVATE'})} className={form.privacyType === 'PRIVATE' ? 'btn-primary' : 'btn-outline'} style={{ flex: 1, padding: "10px" }}>Private</button>
                </div>
              </div>

              <button type="submit" disabled={createLoading} className="btn-primary" style={{ padding: "14px", marginTop: "10px", width: "100%" }}>
                {createLoading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
