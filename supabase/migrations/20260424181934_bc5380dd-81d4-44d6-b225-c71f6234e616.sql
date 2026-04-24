-- Arcade stations registry
CREATE TABLE public.arcade_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code text NOT NULL UNIQUE,
  name text NOT NULL,
  location text NOT NULL,
  console_id text UNIQUE,
  camera_id text,
  status text NOT NULL DEFAULT 'offline',
  ip_address text,
  notes text,
  last_heartbeat_at timestamptz,
  installed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage stations" ON public.arcade_stations
  FOR ALL TO authenticated USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

CREATE TRIGGER arcade_stations_updated BEFORE UPDATE ON public.arcade_stations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tamper events
CREATE TABLE public.arcade_tamper_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES public.arcade_stations(id) ON DELETE SET NULL,
  station_code text,
  event_type text NOT NULL, -- 'reed_switch','accelerometer','camera_pir','camera_offline','enclosure_open'
  severity text NOT NULL DEFAULT 'medium', -- low|medium|high|critical
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  snapshot_url text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_tamper_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view tamper events" ON public.arcade_tamper_events
  FOR SELECT TO authenticated USING (has_role('admin'::app_role));
CREATE POLICY "Admins update tamper events" ON public.arcade_tamper_events
  FOR UPDATE TO authenticated USING (has_role('admin'::app_role));
CREATE POLICY "Admins delete tamper events" ON public.arcade_tamper_events
  FOR DELETE TO authenticated USING (has_role('admin'::app_role));
-- Inserts come via edge function (service role)

CREATE INDEX idx_tamper_station ON public.arcade_tamper_events(station_id, created_at DESC);
CREATE INDEX idx_tamper_unresolved ON public.arcade_tamper_events(resolved, created_at DESC);

-- Heartbeat log
CREATE TABLE public.arcade_station_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid REFERENCES public.arcade_stations(id) ON DELETE CASCADE,
  station_code text,
  cpu_temp numeric,
  uptime_seconds integer,
  active_session_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_station_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view pings" ON public.arcade_station_pings
  FOR SELECT TO authenticated USING (has_role('admin'::app_role));

CREATE INDEX idx_pings_station ON public.arcade_station_pings(station_id, created_at DESC);

-- Budget items
CREATE TABLE public.arcade_budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase text NOT NULL, -- pilot | full_rollout | monthly
  category text NOT NULL, -- hardware_kiosk | hardware_ps5 | hardware_camera | workforce | materials | operating
  label text NOT NULL,
  per_unit_cost numeric NOT NULL DEFAULT 0,
  units integer NOT NULL DEFAULT 1,
  total_cost numeric NOT NULL DEFAULT 0,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage budget" ON public.arcade_budget_items
  FOR ALL TO authenticated USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

CREATE TRIGGER arcade_budget_updated BEFORE UPDATE ON public.arcade_budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workforce roles
CREATE TABLE public.arcade_workforce_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase text NOT NULL, -- pilot | full_rollout | monthly
  role_name text NOT NULL,
  task_description text,
  hours numeric NOT NULL DEFAULT 0,
  hourly_rate numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  payment_type text NOT NULL DEFAULT 'hourly', -- hourly | fixed | retainer | owner
  payment_schedule text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_workforce_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage workforce" ON public.arcade_workforce_roles
  FOR ALL TO authenticated USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

CREATE TRIGGER arcade_workforce_updated BEFORE UPDATE ON public.arcade_workforce_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Operating costs (recurring)
CREATE TABLE public.arcade_operating_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  monthly_cost numeric NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general', -- internet|hosting|sms|maintenance|labor|misc
  notes text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.arcade_operating_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage operating costs" ON public.arcade_operating_costs
  FOR ALL TO authenticated USING (has_role('admin'::app_role)) WITH CHECK (has_role('admin'::app_role));

CREATE TRIGGER arcade_operating_updated BEFORE UPDATE ON public.arcade_operating_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== SEED DATA =====

-- Budget: Pilot hardware (kiosk per-station rolled up)
INSERT INTO public.arcade_budget_items (phase, category, label, per_unit_cost, units, total_cost, sort_order) VALUES
('pilot','hardware_kiosk','Kiosk system (Pi 4B, touchscreen, relay, UPS, lockbox, sensors)',30900,3,92700,10),
('pilot','hardware_ps5','PS5 console + 32" TV + 10 game titles',102000,3,306000,20),
('pilot','hardware_camera','Tamper camera (ESP32-CAM, lens, SD, enclosure)',5750,3,17250,30),
('pilot','materials','Installation materials (screws, ties, conduit, cables)',3500,1,3500,40),
('full_rollout','hardware_kiosk','Kiosk system per station',30900,10,309000,10),
('full_rollout','hardware_ps5','PS5 setup per station',102000,10,1020000,20),
('full_rollout','hardware_camera','Tamper camera per station',5750,10,57500,30),
('full_rollout','materials','Installation materials (bulk)',29300,1,29300,40),
('full_rollout','operating','3-month operating reserve',99360,1,99360,50);

-- Workforce: Pilot
INSERT INTO public.arcade_workforce_roles (phase, role_name, task_description, hours, hourly_rate, total_cost, payment_type, payment_schedule, sort_order) VALUES
('pilot','Procurement assistant','Buy all hardware (Nerokas, Biashara St, Naivas)',8,500,4000,'hourly','After delivery',10),
('pilot','Full-stack developer','Backend, M-Pesa, Pi app, dashboard, camera integration',0,0,318000,'fixed','Milestones 20/30/30/20',20),
('pilot','Electronics technician','Wire Pi, flash SD, bench test, camera (5.5h x 3)',16.5,600,9900,'hourly','Per batch',30),
('pilot','Installation lead','Mount, anchor, conduit, WiFi, live test (2.75h x 3)',8.25,700,5775,'hourly','Per batch',40),
('pilot','Installation helper','Assist mounting and lifting (2.75h x 3)',8.25,400,3300,'hourly','Per batch',50),
('pilot','Trainer','Train 3 site caretakers (1h each)',3,600,1800,'hourly','After session',60),
('pilot','Project lead (you)','Sign agreements, register Paybill, oversee',20,0,0,'owner','—',70),
('full_rollout','Electronics technician','Assembly 5.5h x 7 new stations',38.5,600,23100,'hourly','Per batch',10),
('full_rollout','Installation lead','Install 7 new stations (2.75h x 7)',19.25,700,13475,'hourly','Per batch',20),
('full_rollout','Installation helper','Assist 7 new stations',19.25,400,7700,'hourly','Per batch',30),
('full_rollout','Network configurator','WiFi, heartbeat, camera aim (1.5h x 7)',10.5,600,6300,'hourly','After testing',40),
('full_rollout','Trainer','Train 4 site caretakers (1.5h each)',6,600,3600,'hourly','After session',50),
('full_rollout','Camera calibrator','Set tamper thresholds (0.5h x 10)',5,600,3000,'hourly','After calibration',60),
('full_rollout','Project lead (you)','Oversee rollout, coordinate venues',15,0,0,'owner','—',70),
('monthly','On-call technician','Monthly retainer',0,0,5000,'retainer','Monthly',10),
('monthly','On-call technician (visits)','~2 visits/month at KES 600',2,600,1200,'hourly','Per visit',20),
('monthly','Project lead (you)','Monitoring, dashboard, alerts',32,0,0,'owner','—',30),
('monthly','Caretakers','4 sites — venue staff (no cost)',4,0,0,'owner','—',40);

-- Operating costs (monthly)
INSERT INTO public.arcade_operating_costs (label, monthly_cost, category, sort_order) VALUES
('Internet (4 locations × KES 3,000)',12000,'internet',10),
('VPS hosting (Hetzner CX21)',3200,'hosting',20),
('Africa''s Talking SMS (~900 sessions/mo)',720,'sms',30),
('Domain + SSL + misc',200,'misc',40),
('Maintenance reserve (controllers, etc.)',12000,'maintenance',50),
('On-call technician retainer',5000,'labor',60);