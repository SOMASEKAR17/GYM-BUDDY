"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Trophy, Plus, MapPin, ChevronRight, Search, 
  Shield, Info, CheckCircle2, X, PlusCircle, MinusCircle,
  Activity, TrendingUp, Clock, User
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const GYM_LOCATIONS = [
  "Fitty New (Mens)", "Fitty Old (Mens)", "Outdoor Gym (Mens)", "Indoor Gym (Mens)", "Trendset Gym (Mens)",
  "Girls Gym",
  "Infinity Fitness (Outside)", "Muscle Engineer (Outside)", "IMMC Fit Club (Outside)", "Stay Fit (Outside)", "AJ Fitness (Outside)"
];

interface Group {
  id: string;
  name: string;
  description: string;
  leaderName?: string;
  leaderImage?: string;
  memberCount: number;
  maxMembers: number;
  gymLocation: string;
  verifiedPRs?: number;
  performanceScore?: number;
  dailyDelta?: number;
  previousScore?: number;
  privacyType: string;
  minimumRequirements: string;
}

const DeltaIndicator = ({ delta }: { delta?: number }) => {
  if (!delta || delta === 0) return null;
  const isPositive = delta > 0;
  return (
    <span style={{ 
      fontSize: "10px", 
      fontWeight: 700, 
      color: isPositive ? "#4CAF50" : "#E63946",
      marginLeft: "6px",
      display: "inline-flex",
      alignItems: "center",
      gap: "2px"
    }}>
      {isPositive ? '▲' : '▼'} {Math.abs(Math.round(delta))}%
    </span>
  );
};

export default function GroupsPage() {
  const [leaderboard, setLeaderboard] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [userGroup, setUserGroup] = useState<any>(null);
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    description: "",
    gymLocation: GYM_LOCATIONS[0],
    minimumRequirements: [""] as string[],
    rules: [""] as string[],
    privacyType: "PUBLIC",
    maxMembers: "10"
  });

  useEffect(() => {
    fetchData();
    checkUserGroup();
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

  const checkUserGroup = async () => {
    try {
      const res = await fetch("/api/groups/my-group");
      const data = await res.json();
      setUserGroup(data.group);
    } catch (error) {
      console.error("Error checking user group:", error);
    }
  };

  const addField = (type: 'requirements' | 'rules') => {
    if (type === 'requirements') {
      setForm({ ...form, minimumRequirements: [...form.minimumRequirements, ""] });
    } else {
      setForm({ ...form, rules: [...form.rules, ""] });
    }
  };

  const removeField = (type: 'requirements' | 'rules', index: number) => {
    if (type === 'requirements') {
      if (form.minimumRequirements.length === 1) return;
      setForm({ ...form, minimumRequirements: form.minimumRequirements.filter((_, i) => i !== index) });
    } else {
      if (form.rules.length === 1) return;
      setForm({ ...form, rules: form.rules.filter((_, i) => i !== index) });
    }
  };

  const updateField = (type: 'requirements' | 'rules', index: number, value: string) => {
    if (type === 'requirements') {
      const newReqs = [...form.minimumRequirements];
      newReqs[index] = value;
      setForm({ ...form, minimumRequirements: newReqs });
    } else {
      const newRules = [...form.rules];
      newRules[index] = value;
      setForm({ ...form, rules: newRules });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const payload = {
        ...form,
        minimumRequirements: form.minimumRequirements.filter(r => r.trim()).join("\n"),
        rules: form.rules.filter(r => r.trim()).join("\n"),
        privacyType: "PUBLIC" // All groups are public now
      };
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Group created!");
      setShowCreateModal(false);
      fetchData();
      checkUserGroup();
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>;
  }

  // Get Top 3
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

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
        {!userGroup && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Create Group
          </button>
        )}
      </div>

      {/* Podium Display */}
      <div className="mb-16">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Trophy size={20} color="var(--color-accent)" />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.05em" }}>LEADERBOARD</h2>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 h-auto md:h-[450px]">
          {/* Rank 2 - Left */}
          {topThree[1] && (
            <div className="order-2 md:order-1 flex-1 w-full max-w-[300px] flex flex-col items-center">
              <Link href={`/groups/${topThree[1].id}`} className="w-full">
                <div className="glass-card podium-card podium-2" style={{ 
                  height: "280px", width: "100%", padding: "24px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "3px solid #C0C0C0"
                }}>
                  <div className="rank-label" style={{ color: "#C0C0C0" }}>#2</div>
                  <div className="podium-name">{topThree[1].name}</div>
                  <div className="podium-score" style={{ color: "#C0C0C0" }}>
                    {topThree[1].performanceScore || 0}%
                    <DeltaIndicator delta={topThree[1].dailyDelta} />
                  </div>
                  <div className="podium-prs">{topThree[1].verifiedPRs || 0} PRs</div>
                </div>
              </Link>
            </div>
          )}

          {/* Rank 1 - Middle */}
          {topThree[0] && (
            <div className="order-1 md:order-2 flex-1 w-full max-w-[340px] flex flex-col items-center z-10">
              <Link href={`/groups/${topThree[0].id}`} className="w-full">
                <div className="glass-card podium-card podium-1" style={{ 
                  height: "360px", width: "100%", padding: "32px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "4px solid #FFD700", boxShadow: "0 0 30px rgba(255, 215, 0, 0.15)"
                }}>
                  <div className="rank-label" style={{ color: "#FFD700", fontSize: "28px" }}>#1</div>
                  <div className="podium-name" style={{ fontSize: "22px" }}>{topThree[0].name}</div>
                  <div className="podium-score" style={{ color: "#FFD700", fontSize: "18px" }}>
                    {topThree[0].performanceScore || 0}%
                    <DeltaIndicator delta={topThree[0].dailyDelta} />
                  </div>
                  <div className="podium-prs" style={{ fontSize: "14px" }}>{topThree[0].verifiedPRs || 0} PRs</div>
                </div>
              </Link>
            </div>
          )}

          {/* Rank 3 - Right */}
          {topThree[2] && (
            <div className="order-3 md:order-3 flex-1 w-full max-w-[280px] flex flex-col items-center">
              <Link href={`/groups/${topThree[2].id}`} className="w-full">
                <div className="glass-card podium-card podium-3" style={{ 
                  height: "220px", width: "100%", padding: "20px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "2px solid #CD7F32"
                }}>
                  <div className="rank-label" style={{ color: "#CD7F32", fontSize: "18px" }}>#3</div>
                  <div className="podium-name" style={{ fontSize: "15px" }}>{topThree[2].name}</div>
                  <div className="podium-score" style={{ color: "#CD7F32" }}>
                    {topThree[2].performanceScore || 0}%
                    <DeltaIndicator delta={topThree[2].dailyDelta} />
                  </div>
                  <div className="podium-prs" style={{ fontSize: "11px" }}>{topThree[2].verifiedPRs || 0} PRs</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* List for rest of leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <div className="mb-16">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restOfLeaderboard.map((group, i) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <div className="glass-card flex items-center gap-4 p-4 hover:border-accent group transition-all">
                    <div className="w-8 text-center font-bold text-muted group-hover:text-accent transition-colors">#{i + 4}</div>
                    <div className="flex-1">
                      <div className="font-semibold flex items-center justify-between">
                        {group.name}
                        <DeltaIndicator delta={group.dailyDelta} />
                      </div>
                      <div className="text-xs text-muted">{group.performanceScore || 0}% • {group.verifiedPRs || 0} PRs</div>
                    </div>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      )}

      {/* Section 2: Browse Groups */}
      <div>
        <div className="flex items-center gap-2 mb-6 text-muted">
          <Search size={18} />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em" }}>BROWSE ALL GROUPS</h2>
        </div>

        {allGroups.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted">No groups found. Be the first to create one!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allGroups.map(group => (
              <div key={group.id} className="glass-card flex flex-col sm:flex-row sm:items-center gap-4" style={{ padding: "16px" }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: "10px", 
                  background: group.leaderImage ? `url(${group.leaderImage})` : "rgba(255,255,255,0.05)", 
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex", 
                  alignItems: "center", justifyContent: "center", color: "var(--color-accent)",
                  flexShrink: 0
                }}>
                  {!group.leaderImage && <User size={24} />}
                </div>
                <div className="flex-1">
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{group.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>{group.description.substring(0, 60)}...</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} /> {group.memberCount}/{group.maxMembers} members
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {group.leaderImage ? (
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: `url(${group.leaderImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                      ) : (
                        <User size={12} />
                      )} {group.leaderName}
                    </span>
                  </div>
                </div>
                <Link href={`/groups/${group.id}`}>
                  <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "12px" }}>View</button>
                </Link>
              </div>
            ))}
          </div>
        )}
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
                <label className="form-label-caps">Group Name</label>
                <input required className="form-input" placeholder="e.g. VIT Powerlifters" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div>
                <label className="form-label-caps">Description / Motive</label>
                <textarea required className="form-input" rows={2} placeholder="What is the goal of this group?" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label-caps">Gym Location</label>
                  <select required className="form-input cursor-pointer" value={form.gymLocation} onChange={e => setForm({...form, gymLocation: e.target.value})}>
                    {GYM_LOCATIONS.map(loc => <option key={loc} value={loc} className="bg-[#111]">{loc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label-caps">Max Members</label>
                  <input type="number" className="form-input" min={2} max={50} value={form.maxMembers} onChange={e => setForm({...form, maxMembers: e.target.value})} />
                </div>
              </div>

              {/* Dynamic Requirements */}
              <div>
                <label className="form-label-caps flex items-center justify-center gap-5">
                  <span>Minimum Requirements</span>
                  <button type="button" onClick={() => addField('requirements')} className="text-accent ml-5 translate-y-1 hover:opacity-80 transition-opacity"><PlusCircle size={16} /></button>
                </label>
                <div className="flex flex-col gap-2">
                  {form.minimumRequirements.map((req, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        required 
                        className="form-input flex-1" 
                        placeholder={`Requirement ${i+1}`} 
                        value={req} 
                        onChange={e => updateField('requirements', i, e.target.value)} 
                      />
                      {form.minimumRequirements.length > 1 && (
                        <button type="button" onClick={() => removeField('requirements', i)} className="text-muted hover:text-accent transition-colors"><MinusCircle size={18} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Rules */}
              <div>
                <label className="form-label-caps flex items-center justify-center gap-5 ">
                  <span>Rules</span>
                  <button type="button" onClick={() => addField('rules')} className="text-accent hover:opacity-80 ml-5 translate-y-1 transition-opacity"><PlusCircle size={16} /></button>
                </label>
                <div className="flex flex-col gap-2">
                  {form.rules.map((rule, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        required 
                        className="form-input flex-1" 
                        placeholder={`Rule ${i+1}`} 
                        value={rule} 
                        onChange={e => updateField('rules', i, e.target.value)} 
                      />
                      {form.rules.length > 1 && (
                        <button type="button" onClick={() => removeField('rules', i)} className="text-muted hover:text-accent transition-colors"><MinusCircle size={18} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={createLoading} className="btn-primary" style={{ padding: "14px", marginTop: "10px", width: "100%" }}>
                {createLoading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section 3: Leaderboard Criteria */}
      <div className="mt-20">
        <div className="flex items-center gap-2 mb-8 text-muted">
          <Info size={18} />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em" }}>LEADERBOARD CRITERIA</h2>
        </div>

        <div className="glass-card" style={{ padding: "40px", border: "1px solid rgba(230,57,70,0.1)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[rgba(230,57,70,0.1)] text-accent">
                <Activity size={24} />
              </div>
              <h3 className="text-sm font-bold mb-2">CONSISTENCY (35%)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Rewards regular activity. 1-2 rest days per week are allowed, but scores decay after 3 days of inactivity.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[rgba(52,211,153,0.1)] text-[#34D399]">
                <User size={24} />
              </div>
              <h3 className="text-sm font-bold mb-2">PARTICIPATION (25%)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Calculated based on active contributors vs total members. Encourages full team involvement.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[rgba(255,193,7,0.1)] text-[#FFC107]">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-sm font-bold mb-2">GROWTH (25%)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Incentivizes progress. Measured by the average weight improvement percentage on verified PRs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 rounded-full bg-[rgba(59,130,246,0.1)] text-[#3B82F6]">
                <Shield size={24} />
              </div>
              <h3 className="text-sm font-bold mb-2">QUALITY (15%)</h3>
              <p className="text-xs text-muted leading-relaxed">
                Ensures fair play. Penalizes suspicious verification patterns and rapid endorsement times.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.05)] text-center">
             <p className="text-xs text-muted italic">
               The leaderboard is updated in real-time. Verified PRs requires endorsements from other group members.
             </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .podium-card {
           cursor: pointer;
        }
        .rank-label {
           font-family: var(--font-heading);
           font-weight: 800;
           margin-bottom: 12px;
        }
        .podium-name {
           font-weight: 700;
           text-align: center;
           margin-bottom: 8px;
        }
        .podium-score {
           font-weight: 600;
           margin-bottom: 4px;
        }
        .podium-prs {
           color: var(--color-text-muted);
           text-transform: uppercase;
           letter-spacing: 0.1em;
           font-weight: 600;
        }
        .form-label-caps {
           font-size: 11px;
           color: var(--color-text-secondary);
           text-transform: uppercase;
           font-weight: 700;
           display: block;
           margin-bottom: 6px;
           letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
