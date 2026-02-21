"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Users, MapPin, Calendar, Info, Shield, 
  ArrowLeft, CheckCircle2, Clock, Crown 
} from "lucide-react";
import { toast } from "react-hot-toast";

interface GroupDetails {
  id: string;
  name: string;
  description: string;
  gymLocation: string;
  minimumRequirements: string;
  rules: string;
  privacyType: string;
  maxMembers: number;
  leader: { id: string; name: string; profileImage?: string };
  members: { role: string; user: { id: string; name: string; profileImage?: string } }[];
  _count: { members: number };
}

export default function GroupDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{ group: GroupDetails; userRole: string | null; hasRequested: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error);
        router.push("/groups");
        return;
      }
      setData(json);
    } catch (error) {
      toast.error("Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/groups/${id}/join`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error);
        return;
      }
      toast.success("Request sent to the group leader!");
      fetchGroup();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;
  if (!data) return null;

  const { group, userRole, hasRequested } = data;

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-10">
      <button 
        onClick={() => router.push("/groups")} 
        className="flex items-center gap-2 text-sm color-text-muted mb-8 hover:text-white transition-colors"
        style={{ background: "none", border: "none" }}
      >
        <ArrowLeft size={16} /> Back to Groups
      </button>

      <div className="glass-card mb-8" style={{ padding: "32px" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "36px", fontWeight: 700, marginBottom: "8px" }}>{group.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1.5"><Crown size={14} color="var(--color-accent)" /> Leader: {group.leader.name}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} /> {group.gymLocation}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {group._count.members} / {group.maxMembers} members</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 shrink-0">
            {userRole ? (
              <button 
                onClick={() => router.push("/groups/dashboard")}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            ) : hasRequested ? (
              <button className="btn-outline cursor-default" style={{ opacity: 0.7 }} disabled>
                <Clock size={16} className="inline mr-2" /> Pending Approval
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleJoinRequest}
                disabled={joining}
              >
                Request to Join
              </button>
            )}
            <div style={{ textAlign: "center", fontSize: "11px", color: "var(--color-text-muted)" }}>
              {group.privacyType === "PUBLIC" ? "Public Group" : "Invite Only"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-8">
          <section>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.05em" }}>GROUP MOTIVE</h2>
            <div className="glass-card" style={{ padding: "24px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {group.description}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.05em" }}>MEMBERS</h2>
            <div className="glass-card" style={{ padding: "16px" }}>
              <div className="flex flex-col gap-3">
                {group.members.map(m => (
                  <div key={m.user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>{m.user.name}</div>
                        <div style={{ fontSize: "11px", color: m.role === 'LEADER' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>{m.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Requirements & Rules */}
        <div className="flex flex-col gap-8">
          <section>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.05em" }}>REQUIREMENTS</h2>
            <div className="glass-card" style={{ padding: "20px" }}>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{group.minimumRequirements}</p>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "0.05em" }}>RULES</h2>
            <div className="glass-card" style={{ padding: "20px", border: "1px solid rgba(230,57,70,0.2)" }}>
              <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{group.rules}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
