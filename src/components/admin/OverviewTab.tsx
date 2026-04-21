import { Users, Heart, Gamepad2, MessageSquare, Image, Ticket, TrendingUp } from "lucide-react";

type Stats = {
  volunteers: { total: number; pending: number; approved: number };
  donations: { total: number; sum: number };
  arcade: { total: number; pending: number };
  concerns: { total: number; pending: number };
  photos: { total: number; pending: number };
  tickets: { total: number; open: number };
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  subValue?: string;
}) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-primary" />
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
    <p className="text-2xl font-bold text-foreground font-display">{value}</p>
    {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
  </div>
);

const OverviewTab = ({ stats }: { stats: Stats }) => (
  <div className="space-y-4">
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">Today's snapshot</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Live numbers across volunteers, donations, arcade, support and uploads.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={Users} label="Volunteers" value={stats.volunteers.total} subValue={`${stats.volunteers.pending} pending · ${stats.volunteers.approved} approved`} />
      <StatCard icon={Heart} label="Donations" value={stats.donations.total} subValue={`KSh ${stats.donations.sum.toLocaleString()}`} />
      <StatCard icon={Gamepad2} label="Arcade plays" value={stats.arcade.total} subValue={`${stats.arcade.pending} to verify`} />
      <StatCard icon={MessageSquare} label="Concerns" value={stats.concerns.total} subValue={`${stats.concerns.pending} pending`} />
      <StatCard icon={Image} label="Photos" value={stats.photos.total} subValue={`${stats.photos.pending} to review`} />
      <StatCard icon={Ticket} label="Tickets" value={stats.tickets.total} subValue={`${stats.tickets.open} open`} />
    </div>
  </div>
);

export default OverviewTab;
