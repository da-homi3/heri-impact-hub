import { motion } from "framer-motion";
import { Camera, Heart, MessageCircle, Send, Bookmark, MapPin, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const galleryPosts = [
  {
    username: "herizon_volunteers",
    location: "Kibera, Nairobi",
    caption: "School supplies delivered to 120 children today! 📚✏️ Every notebook is a step toward a brighter future. #HerizonImpact",
    likes: 284,
    comments: 32,
    timeAgo: "2d",
  },
  {
    username: "herizon_volunteers",
    location: "Mombasa, Kenya",
    caption: "Over 500 clothing items sorted and handed out to families in need 👕❤️ Your donations made this possible!",
    likes: 412,
    comments: 56,
    timeAgo: "5d",
  },
  {
    username: "herizon_volunteers",
    location: "Kisumu, Kenya",
    caption: "Community food bank restocked! 80 households received food parcels today 🍞🥬 Together we fight hunger.",
    likes: 367,
    comments: 41,
    timeAgo: "1w",
  },
  {
    username: "herizon_volunteers",
    location: "Nakuru, Kenya",
    caption: "Brought smiles to 60 children at the children's home with donated toys and games 🧸🎮 Pure joy!",
    likes: 523,
    comments: 67,
    timeAgo: "2w",
  },
  {
    username: "herizon_volunteers",
    location: "Nyeri, Kenya",
    caption: "Warm blankets delivered to elderly community members before the cold season 🧣💛 Warmth is love.",
    likes: 198,
    comments: 24,
    timeAgo: "3w",
  },
  {
    username: "herizon_volunteers",
    location: "Thika, Kenya",
    caption: "300+ books donated to three primary schools! 📖 Knowledge is the greatest gift. #EducationForAll",
    likes: 445,
    comments: 53,
    timeAgo: "1mo",
  },
];

const PostCard = ({ post, index }: { post: typeof galleryPosts[0]; index: number }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-border/50 rounded-xl overflow-hidden max-w-[468px] mx-auto w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">H</span>
          </div>
          <div>
            <p className="text-foreground text-xs font-semibold leading-tight">{post.username}</p>
            <p className="text-muted-foreground text-[10px] flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {post.location}
            </p>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Image placeholder */}
      <div className="aspect-square bg-muted/50 flex items-center justify-center relative">
        <div className="text-center">
          <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-1" />
          <p className="text-[10px] text-muted-foreground/40">Volunteer photo coming soon</p>
        </div>
        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full">
          Verified
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)} className="hover-scale">
              <Heart
                className={`w-5 h-5 transition-colors ${liked ? "fill-primary text-primary" : "text-foreground"}`}
              />
            </button>
            <MessageCircle className="w-5 h-5 text-foreground" />
            <Send className="w-5 h-5 text-foreground" />
          </div>
          <button onClick={() => setSaved(!saved)} className="hover-scale">
            <Bookmark
              className={`w-5 h-5 transition-colors ${saved ? "fill-foreground text-foreground" : "text-foreground"}`}
            />
          </button>
        </div>

        {/* Likes */}
        <p className="text-foreground text-xs font-semibold mb-1">
          {(liked ? post.likes + 1 : post.likes).toLocaleString()} likes
        </p>

        {/* Caption */}
        <p className="text-xs text-foreground mb-1">
          <span className="font-semibold">{post.username}</span>{" "}
          <span className="text-muted-foreground">{post.caption}</span>
        </p>

        {/* Comments & time */}
        <p className="text-[10px] text-muted-foreground mb-1">
          View all {post.comments} comments
        </p>
        <p className="text-[9px] text-muted-foreground/70 uppercase pb-2.5 border-b border-border/30 mb-0">
          {post.timeAgo} ago
        </p>
      </div>

      {/* Comment input */}
      <div className="px-3 py-2 flex items-center gap-2">
        <span className="text-sm">😊</span>
        <p className="text-xs text-muted-foreground flex-1">Add a comment...</p>
      </div>
    </motion.div>
  );
};

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
            Real stories from our volunteers — see the difference you make, one post at a time.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryPosts.map((post, i) => (
            <PostCard key={post.location + i} post={post} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Updates posted by verified Herizon volunteers after every mission.
        </motion.p>
      </div>
    </section>
  );
};

export default ImpactGallery;
