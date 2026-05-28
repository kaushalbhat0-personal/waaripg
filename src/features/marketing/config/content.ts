export const amenities = [
  {
    icon: "Wifi",
    title: "High-Speed WiFi",
    description: "500 Mbps dedicated fiber connectivity across the property.",
  },
  {
    icon: "Coffee",
    title: "In-House Cafe",
    description: "Premium cafe with barista coffee, snacks, and redeemable workspace access.",
  },
  {
    icon: "Briefcase",
    title: "Workspace",
    description: "Dedicated study and remote work areas with ergonomic seating.",
  },
  {
    icon: "Shirt",
    title: "Laundry",
    description: "On-site laundry service with washing machines and ironing.",
  },
  {
    icon: "ShieldCheck",
    title: "24/7 Security",
    description: "CCTV surveillance, biometric access, and round-the-clock security staff.",
  },
  {
    icon: "Sparkles",
    title: "Housekeeping",
    description: "Regular cleaning service for rooms and common areas.",
  },
  {
    icon: "Zap",
    title: "Power Backup",
    description: "Full power backup with generator for uninterrupted living.",
  },
  {
    icon: "ScanEye",
    title: "CCTV Surveillance",
    description: "Comprehensive camera coverage in all common areas and corridors.",
  },
  {
    icon: "Users",
    title: "Community Events",
    description: "Regular meetups, gaming nights, movie screenings, and community dinners.",
  },
];

export const roomTypes = [
  {
    title: "Single Room",
    subtitle: "Your Private Sanctuary",
    price: "₹8,999",
    period: "/month",
    description:
      "Fully furnished private room with attached bathroom, study desk, wardrobe, and premium mattress.",
    features: ["Attached bathroom", "Study desk & chair", "Wardrobe & storage", "Premium mattress", "Window with curtains", "Personal WiFi access point"],
    popular: false,
  },
  {
    title: "Twin Sharing",
    subtitle: "Split the Stay, Double the Fun",
    price: "₹5,999",
    period: "/month/person",
    description:
      "Spacious shared room with two beds, study area, and shared bathroom. Perfect for friends or batchmates.",
    features: ["Two premium beds", "Shared bathroom", "Individual study desks", "Shared wardrobe", "Personal shelving", "Common area access"],
    popular: true,
  },
  {
    title: "Dormitory",
    subtitle: "Budget-Friendly Community Living",
    price: "₹3,499",
    period: "/month/person",
    description:
      "Clean and comfortable multi-bed dorm with locker storage, study area, and community atmosphere.",
    features: ["Personal locker", "Study table per bed", "Reading lamp", "Curtain privacy", "Blanket & pillow", "Community lounge access"],
    popular: false,
  },
];

export const cafeFeatures = [
  {
    title: "Workspace Access",
    description: "Just ₹70 for 2 hours of premium workspace.",
    highlight: "₹70 = 2 Hours",
  },
  {
    title: "Redeemable Credits",
    description: "Your workspace fee is redeemable on drinks and snacks.",
    highlight: "100% Redeemable",
  },
  {
    title: "Barista Coffee",
    description: "Specialty coffee, teas, smoothies, and fresh snacks.",
    highlight: "Premium Brews",
  },
  {
    title: "Study Environment",
    description: "Quiet zones, high-speed WiFi, power outlets at every seat.",
    highlight: "Built for Focus",
  },
];

export const testimonials = [
  {
    name: "Aditi Sharma",
    role: "Design Intern",
    image: "",
    content:
      "The cafe workspace is a game-changer. I pay ₹70, grab a coffee, and work for hours in a productive environment. Way better than working from home.",
  },
  {
    name: "Rahul Verma",
    role: "Freelance Developer",
    image: "",
    content:
      "Moved in for the room, stayed for the community. The high-speed WiFi, quiet workspaces, and like-minded people make this the perfect place for remote work.",
  },
  {
    name: "Priya Patel",
    role: "Medical Student",
    image: "",
    content:
      "Safe, clean, and affordable. The study areas are always quiet when I need to focus, and the cafe is great for breaks. Highly recommended for students.",
  },
  {
    name: "Arjun Nair",
    role: "Startup Founder",
    image: "",
    content:
      "The vibe here is incredible. Gaming nights, community dinners, co-working sessions — it's like WeWork meets a premium coliving space. Absolutely love it.",
  },
];

export const galleryImages = [
  { src: "/gallery/room-1.jpg", alt: "Premium single room", category: "Rooms" },
  { src: "/gallery/room-2.jpg", alt: "Twin sharing room", category: "Rooms" },
  { src: "/gallery/room-3.jpg", alt: "Dormitory", category: "Rooms" },
  { src: "/gallery/cafe-1.jpg", alt: "Cafe workspace", category: "Cafe" },
  { src: "/gallery/cafe-2.jpg", alt: "Coffee and snacks", category: "Cafe" },
  { src: "/gallery/common-1.jpg", alt: "Lounge area", category: "Common Areas" },
  { src: "/gallery/common-2.jpg", alt: "Study room", category: "Common Areas" },
  { src: "/gallery/community-1.jpg", alt: "Community event", category: "Community" },
  { src: "/gallery/community-2.jpg", alt: "Gaming night", category: "Community" },
];

export const stats = [
  { value: "500+", label: "Happy Residents" },
  { value: "50+", label: "Events Hosted" },
  { value: "4.8★", label: "Average Rating" },
  { value: "100%", label: "Secure Living" },
];

export const faqs = [
  {
    q: "What is the check-in and check-out process?",
    a: "Check-in is after 12 PM and check-out by 10 AM. Early check-in and late check-out can be arranged based on availability.",
  },
  {
    q: "Are meals included?",
    a: "We offer optional meal plans at affordable rates. The in-house cafe is available for all residents with special discounts.",
  },
  {
    q: "Is the workspace access really just ₹70?",
    a: "Yes! Pay ₹70 for 2 hours of premium workspace, fully redeemable on drinks and snacks from our cafe.",
  },
  {
    q: "Can I book a room online?",
    a: "Absolutely. You can check availability and submit an inquiry through our website. We'll confirm within 24 hours.",
  },
  {
    q: "Is there a minimum stay period?",
    a: "Single rooms require a minimum 3-month commitment. Twin sharing and dormitories have a 1-month minimum.",
  },
  {
    q: "How is security at the property?",
    a: "We have 24/7 security, CCTV surveillance, biometric access control, and separate floors for men and women.",
  },
];
