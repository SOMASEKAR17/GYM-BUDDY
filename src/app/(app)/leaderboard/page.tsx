"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, Users, User, Medal, TrendingUp, Search, Info, Activity, Shield
} from "lucide-react";
import { toast } from "react-hot-toast";

interface GroupLB {
  id: string;
  name: string;
  leaderName: string;
  leaderImage?: string;
  memberCount: number;
  verifiedPRs: number;
  performanceScore: number;
  dailyDelta: number;
}

interface UserLB {
  id: string;
  name: string;
  image?: string;
  course?: string;
  year?: string;
  verifiedPRs: number;
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

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"groups" | "individuals">("groups");
  const [groupLb, setGroupLb] = useState<GroupLB[]>([]);
  const [userLb, setUserLb] = useState<UserLB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (activeTab === "groups") {
        const res = await fetch("/api/groups?type=leaderboard");
        const data = await res.json();
        setGroupLb(data.groups || []);
      } else {
        const res = await fetch("/api/leaderboard/individuals");
        const data = await res.json();
        setUserLb(data.users || []);
      }
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const topThree = activeTab === "groups" ? groupLb.slice(0, 3) : userLb.slice(0, 3);
  const rest = activeTab === "groups" ? groupLb.slice(3) : userLb.slice(3);

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="badge badge-red mb-4 mx-auto inline-flex gap-2">
          <Trophy size={14} /> HALL OF FAME
        </div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, marginBottom: "12px" }}>
          THE <span className="text-gradient">LEADERBOARD</span>
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
          Ranking the most consistent and dedicated athletes in VIT.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-12">
        <button 
          onClick={() => setActiveTab("groups")}
          className={activeTab === "groups" ? "btn-primary" : "btn-outline"}
          style={{ width: "160px" }}
        >
          <Users size={18} className="mr-2 inline" /> Groups
        </button>
        <button 
          onClick={() => setActiveTab("individuals")}
          className={activeTab === "individuals" ? "btn-primary" : "btn-outline"}
          style={{ width: "160px" }}
        >
          <User size={18} className="mr-2 inline" /> Individuals
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><div className="spinner" /></div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 h-auto md:h-[450px] mb-16">
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="order-2 md:order-1 flex-1 w-full max-w-[340px] flex flex-col items-center">
                <div className="glass-card podium-card podium-2" style={{ 
                  height: "280px", width: "100%", padding: "24px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "3px solid #C0C0C0"
                }}>
                  <div className="rank-label" style={{ color: "#C0C0C0" }}>#2</div>
                  <div style={{ 
                    width: 60, height: 60, borderRadius: "50%", 
                    backgroundColor: activeTab === 'groups' ? 'rgba(255,255,255,0.05)' : (topThree[1] as UserLB).image ? 'transparent' : '#333',
                    backgroundImage: activeTab === 'individuals' && (topThree[1] as UserLB).image ? `url(${(topThree[1] as UserLB).image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {activeTab === 'individuals' && !(topThree[1] as UserLB).image && <User size={24} />}
                    {activeTab === 'groups' && <Users size={24} color="var(--color-accent)" />}
                  </div>
                  <div className="podium-name">{topThree[1].name}</div>
                  <div className="podium-score" style={{ color: "#C0C0C0" }}>
                    {activeTab === 'groups' ? `${(topThree[1] as GroupLB).performanceScore}%` : `${(topThree[1] as UserLB).verifiedPRs} PRs`}
                    {activeTab === 'groups' && <DeltaIndicator delta={(topThree[1] as GroupLB).dailyDelta} />}
                  </div>
                  <div className="podium-prs">{activeTab === 'groups' ? `${(topThree[1] as GroupLB).verifiedPRs} PRs` : (topThree[1] as UserLB).course || ''}</div>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="order-1 md:order-2 flex-1 w-full max-w-[340px] flex flex-col items-center z-10 transition-transform hover:scale-105">
                <div className="glass-card podium-card podium-1" style={{ 
                  height: "360px", width: "100%", padding: "32px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "4px solid #FFD700", boxShadow: "0 0 30px rgba(255, 215, 0, 0.15)"
                }}>
                   <div style={{ position: 'absolute', top: -20, fontSize: 32 }}>👑</div>
                  <div className="rank-label" style={{ color: "#FFD700", fontSize: "28px" }}>#1</div>
                  <div style={{ 
                    width: 80, height: 80, borderRadius: "50%", 
                    backgroundColor: activeTab === 'groups' ? 'rgba(255,255,255,0.05)' : (topThree[0] as UserLB).image ? 'transparent' : '#333',
                    backgroundImage: activeTab === 'individuals' && (topThree[0] as UserLB).image ? `url(${(topThree[0] as UserLB).image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid #FFD700'
                  }}>
                    {activeTab === 'individuals' && !(topThree[0] as UserLB).image && <User size={32} />}
                    {activeTab === 'groups' && <Users size={32} color="var(--color-accent)" />}
                  </div>
                  <div className="podium-name" style={{ fontSize: "22px" }}>{topThree[0].name}</div>
                  <div className="podium-score" style={{ color: "#FFD700", fontSize: "18px" }}>
                    {activeTab === 'groups' ? `${(topThree[0] as GroupLB).performanceScore}%` : `${(topThree[0] as UserLB).verifiedPRs} PRs`}
                    {activeTab === 'groups' && <DeltaIndicator delta={(topThree[0] as GroupLB).dailyDelta} />}
                  </div>
                  <div className="podium-prs" style={{ fontSize: "14px" }}>{activeTab === 'groups' ? `${(topThree[0] as GroupLB).verifiedPRs} PRs` : (topThree[0] as UserLB).course || ''}</div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="order-3 md:order-3 flex-1 w-full max-w-[340px] flex flex-col items-center">
                <div className="glass-card podium-card podium-3" style={{ 
                  height: "220px", width: "100%", padding: "20px", 
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderTop: "2px solid #CD7F32"
                }}>
                  <div className="rank-label" style={{ color: "#CD7F32", fontSize: "18px" }}>#3</div>
                  <div style={{ 
                    width: 50, height: 50, borderRadius: "50%", 
                    backgroundColor: activeTab === 'groups' ? 'rgba(255,255,255,0.05)' : (topThree[2] as UserLB).image ? 'transparent' : '#333',
                    backgroundImage: activeTab === 'individuals' && (topThree[2] as UserLB).image ? `url(${(topThree[2] as UserLB).image})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {activeTab === 'individuals' && !(topThree[2] as UserLB).image && <User size={20} />}
                    {activeTab === 'groups' && <Users size={20} color="var(--color-accent)" />}
                  </div>
                  <div className="podium-name" style={{ fontSize: "15px" }}>{topThree[2].name}</div>
                  <div className="podium-score" style={{ color: "#CD7F32" }}>
                    {activeTab === 'groups' ? `${(topThree[2] as GroupLB).performanceScore}%` : `${(topThree[2] as UserLB).verifiedPRs} PRs`}
                    {activeTab === 'groups' && <DeltaIndicator delta={(topThree[2] as GroupLB).dailyDelta} />}
                  </div>
                  <div className="podium-prs" style={{ fontSize: "11px" }}>{activeTab === 'groups' ? `${(topThree[2] as GroupLB).verifiedPRs} PRs` : (topThree[2] as UserLB).course || ''}</div>
                </div>
              </div>
            )}
          </div>

          {/* List for rest */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
            {rest.map((item, i) => (
              <div key={item.id} className="glass-card flex items-center gap-4 p-4 hover:border-accent group transition-all">
                <div className="w-8 text-center font-bold text-muted group-hover:text-accent transition-colors">#{i + 4}</div>
                
                <div style={{ 
                  width: 40, height: 40, borderRadius: "50%", 
                  backgroundColor: activeTab === 'groups' ? 'rgba(255,255,255,0.05)' : (item as UserLB).image ? 'transparent' : '#333',
                  backgroundImage: activeTab === 'individuals' && (item as UserLB).image ? `url(${(item as UserLB).image})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   {activeTab === 'individuals' && !(item as UserLB).image && <User size={18} />}
                   {activeTab === 'groups' && <Users size={18} color="var(--color-accent)" />}
                </div>

                <div className="flex-1">
                  <div className="font-semibold flex items-center justify-between">
                    {item.name}
                    {activeTab === 'groups' && <DeltaIndicator delta={(item as GroupLB).dailyDelta} />}
                  </div>
                  <div className="text-xs text-muted">
                    {activeTab === 'groups' ? `${(item as GroupLB).performanceScore}% • ${(item as GroupLB).verifiedPRs} PRs` : `${(item as UserLB).verifiedPRs} Verified PRs`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="mt-20">
        <div className="flex items-center gap-2 mb-8 text-muted">
          <Info size={18} />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.05em" }}>HOW WE RANK</h2>
        </div>

        <div className="glass-card" style={{ padding: "40px", border: "1px solid rgba(230,57,70,0.1)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="mb-4 p-3 rounded-full bg-[rgba(230,57,70,0.1)] text-accent inline-block"><Activity size={24} /></div>
              <h3 className="text-sm font-bold mb-2">CONSISTENCY</h3>
              <p className="text-xs text-muted">Groups are ranked by weighted performance over 7 days.</p>
            </div>
            <div>
              <div className="mb-4 p-3 rounded-full bg-[rgba(52,211,153,0.1)] text-[#34D399] inline-block"><User size={24} /></div>
              <h3 className="text-sm font-bold mb-2">INDIVIDUALS</h3>
              <p className="text-xs text-muted">Ranked strictly by the total count of verified PRs achieved.</p>
            </div>
            <div>
              <div className="mb-4 p-3 rounded-full bg-[rgba(255,193,7,0.1)] text-[#FFC107] inline-block"><Shield size={24} /></div>
              <h3 className="text-sm font-bold mb-2">VERIFICATION</h3>
              <p className="text-xs text-muted">Every PR must be endorsed by group peers to count.</p>
            </div>
            <div>
              <div className="mb-4 p-3 rounded-full bg-[rgba(59,130,246,0.1)] text-[#3B82F6] inline-block"><Medal size={24} /></div>
              <h3 className="text-sm font-bold mb-2">PRESTIGE</h3>
              <p className="text-xs text-muted">A higher score ensures your group stays on the podium.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .podium-card { position: relative; overflow: visible; }
        .rank-label { font-family: var(--font-heading); font-weight: 800; margin-bottom: 8px; }
        .podium-name { font-weight: 700; text-align: center; margin-bottom: 4px; }
        .podium-score { font-weight: 600; margin-bottom: 2px; }
        .podium-prs { color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; font-size: 10px; }
      `}</style>
    </div>
  );
}
