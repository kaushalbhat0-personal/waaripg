export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/cafe", label: "Cafe" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const socialLinks = {
  instagram: "https://instagram.com/waaripg",
  whatsapp: "https://wa.me/919876543210",
  phone: "+91 98765 43210",
  email: "hello@waaripg.com",
} as const;

export const siteConfig = {
  name: "WaaRi PG",
  tagline: "Stay. Study. Work. Chill.",
  description:
    "Premium co-living and hostel experience with cafe workspace in the heart of the city. Built for students, interns, remote workers, and digital nomads.",
  location: "Your City, India",
} as const;
