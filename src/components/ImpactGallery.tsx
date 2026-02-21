import { motion } from "framer-motion";
import { Camera, Heart, MapPin, Calendar } from "lucide-react";

const galleryPosts = [
  {
    title: "School supplies delivered to Kibera",
    location: "Kibera, Nairobi",
    date: "Feb 2026",
    description: "Our volunteers distributed notebooks, pens and bags to 120 children.",
    icon: Heart,
  },
  {
    title: "Clothing drive in Mombasa",
    location: "Mombasa, Kenya",
    date: "Jan 2026",
    description: "Over 500 clothing items sorted and handed out to families in need.",
    icon: Heart,
  },
  {
    title: "Community food bank restock",
    location: "Kisumu, Kenya",
    date: "Dec 2025",
    description: "Volunteers packed and delivered food parcels to 80 households.",
    icon: Heart,
  },
  {
    title: "Toy drive for children's home",
    location: "Nakuru, Kenya",
    date: "Nov 2025",
    description: "Brought joy to 60 children with donated toys and games.",
    icon: Heart,
  },
  {
    title: "Winter blankets distribution",
    location: "Nyeri, Kenya",
    date: "Oct 2025",
    description: "Warm blankets delivered to elderly community members before the cold season.",
    icon: Heart,
  },
  {
    title: "Book drive at local schools",
    location: "Thika, Kenya",
    date: "Sep 2025",
    description: "Donated 300+ books to three primary schools to support learning.",
    icon: Heart,
  },
];

const ImpactGallery = () => {
  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            From the field
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-foreground mb-3">
            How your donation is used
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real stories and updates from our volunteers on the ground — see the difference you make.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryPosts.map((post, i) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Photo placeholder area */}
              <div className="aspect-[4/3] bg-muted/60 flex items-center justify-center relative overflow-hidden">
                <div className="text-center p-4">
                  <Camera className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground/50">Volunteer photo coming soon</p>
                </div>
                <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Verified
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1.5 line-clamp-1">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Updates are posted by verified Herizon volunteers after every mission.
        </motion.p>
      </div>
    </section>
  );
};

export default ImpactGallery;
