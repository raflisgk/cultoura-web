import React, { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight, ArrowLeft, ArrowDown, MapPin, Play, ChevronRight, Sparkles, Heart, Menu, X,
  ShoppingBag, Ticket, HandHeart, Leaf, Droplet, Shuffle, Package, Truck,
  Quote, Globe2, Users, Layers, PenTool, Waves, Scroll, Swords, Hammer
} from "lucide-react";
import { INDONESIA_PATH, INDONESIA_VIEWBOX } from "./indonesiaMap";

// Cultoura — Every Heritage Has a Future.
// Color tokens: forest #214E3B, cream #F8F4EC, terracotta #C96A3D, gold #C8A25A, umber #4A2E1E

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  .font-display { font-family: 'Fraunces', serif; }
  .font-body { font-family: 'Manrope', sans-serif; }
  html { scroll-behavior: smooth; }
  ::selection { background: #C96A3D; color: #F8F4EC; }
  
`;


const img = (q, w = 1200, h = 1400) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const UMBER = "#4A2E1E";

// Content data — 20 craft heritage points spanning Sumatra to Papua.
// Coordinates (x/y as % of map viewBox) are projected from real geographic
// coordinates using the same Mercator projection as the base map, so every
// pin sits exactly where that city is on the archipelago.

const REGIONS = [
  { id: "aceh", name: "Aceh", x: 0.9, y: 11.7, craft: "Kerawang Gayo", story: "Sulaman benang emas khas Gayo ini menghiasi busana adat, setiap motifnya menyimpan filosofi adat dan alam Tanah Rencong.", image: "./images/kerawanggayoaceh.jpg" },
  { id: "sumut", name: "Sumatra Utara", x: 8.4, y: 25.4, craft: "Ulos", story: "Di tepi Danau Toba, kain Ulos ditenun sebagai lambang restu — diberikan saat kelahiran, pernikahan, hingga kematian.", image: "./images/ulossumatrautara.jpg" },
  { id: "sumbar", name: "Sumatra Barat", x: 11.8, y: 39.2, craft: "Tenun Songket Minang", story: "Benang emas ditenun dengan tangan di Pandai Sikek, diwariskan dari nenek ke cucu, seutas demi seutas.", image: "./images/tenunsongketminangsumbar.jpg" },
  { id: "sumsel", name: "Sumatra Selatan", x: 21.3, y: 51.8, craft: "Songket Palembang", story: "Songket Palembang dahulu hanya dikenakan bangsawan Kesultanan — kilau benang emasnya masih ditenun dengan cara yang sama hingga kini.", image: "./images/songketpalembangsumsel.jpg" },
  { id: "jabar", name: "Jawa Barat", x: 29.4, y: 69.3, craft: "Batik Mega Mendung", story: "Motif awan dari Cirebon ini lahir dari akulturasi budaya Tionghoa dan pesisir Jawa, melambangkan kesabaran menahan amarah.", image: "./images/batikmegamendungjabar.jpg" },
  { id: "jateng", name: "Jawa Tengah", x: 34.3, y: 73.4, craft: "Batik Tulis", story: "Di Solo, malam panas dan katun bertemu membentuk pola yang dulu menandai derajat dan upacara adat.", image: "./images/batiktulisjateng.jpg" },
  { id: "yogya", name: "D.I. Yogyakarta", x: 33.3, y: 74.5, craft: "Wayang Kulit", story: "Kulit kerbau ditatah dan diwarnai selama berminggu-minggu sebelum tampil menuturkan epos semalam suntuk.", image: "./images/wayangkulitjogja.jpg" },
  { id: "jepara", name: "Jepara", x: 34, y: 68.8, craft: "Ukiran Jepara", story: "Satu panel relief bisa memakan waktu tiga bulan, dipahat dengan kesabaran tanpa henti.", image: "./images/ukiranjepara.jpg" },
  { id: "malang", name: "Jawa Timur", x: 38.2, y: 75.3, craft: "Topeng Malangan", story: "Topeng dari kayu mahoni, dicat untuk menampung roh raja-raja masa lampau.", image: "./images/topengmalanganjatim.jpg" },
  { id: "bali", name: "Bali", x: 43.9, y: 77.8, craft: "Ukiran & Perak", story: "Di Ubud, ukiran adalah doa yang dibuat kasat mata; di Celuk, perak ditempa jadi perhiasan upacara turun-temurun.", image: "./images/ukiran&perakbali.jpg" },
  { id: "ntb", name: "Nusa Tenggara Barat", x: 46.2, y: 78.9, craft: "Tenun Songket Sasak", story: "Di Desa Sukarara, Lombok, gadis Sasak belajar menenun sejak kecil — songketnya jadi bekal restu sebelum menikah.", image: "./images/tenunsongketsasakntb.jpg" },
  { id: "ntt_sikka", name: "NTT · Sikka", x: 58.9, y: 78.4, craft: "Tenun Ikat", story: "Diikat dan diwarnai dengan tangan selama berminggu-minggu sebelum satu benang pun menyentuh alat tenun.", image: "./images/tenunikatsikkantt.jpg" },
  { id: "ntt_sumba", name: "NTT · Sumba", x: 53.9, y: 83.3, craft: "Tenun Ikat Sumba", story: "Motif kuda dan skull tree pada Hinggi Sumba menandakan derajat penenunnya — sebagian pola hanya boleh dipakai bangsawan.", image: "./images/tentunikatsumbantt.jpg" },
  { id: "kalbar", name: "Kalimantan Barat", x: 31.1, y: 37.9, craft: "Tenun Corak Insang", story: "Pola bersisik ikan dari Pontianak ini menenun identitas pesisir Melayu Kalimantan ke dalam benang songket.", image: "./images/tenuncorakinsangkalbar.jpg" },
  { id: "kalteng", name: "Kalimantan Tengah", x: 39.8, y: 45.7, craft: "Anyaman Rotan Dayak", story: "Rotan hutan dianyam suku Dayak menjadi tas dan tikar dengan motif burung enggang, penjaga spiritual masyarakat adat.", image: "./images/anyamanrotandayakkaltim.jpg" },
  { id: "sulsel", name: "Sulawesi Selatan", x: 53.7, y: 52.2, craft: "Ukiran & Tenun Toraja", story: "Rumah Tongkonan diukir penuh simbol leluhur, sementara benang sutra Toraja ditenun untuk upacara Rambu Solo.", image: "./images/songketpalembangsumsel.jpg" },
  { id: "gorontalo", name: "Gorontalo", x: 60.7, y: 35.3, craft: "Karawo", story: "Sulaman kerawang khas Gorontalo ini dikerjakan dengan mencabut serat kain satu per satu sebelum disulam ulang jadi motif.", image: "./images/karawogorontalo.jpg" },
  { id: "maluku", name: "Maluku", x: 71.8, y: 55.1, craft: "Tenun & Ukiran Maluku", story: "Kain tenun dan ukiran kayu di Kepulauan Maluku merekam jalur rempah yang pernah menghubungkan nusantara ke dunia.", image: "./images/tenunmaluku.jpg" },
  { id: "papua_wamena", name: "Papua Pegunungan", x: 95, y: 57, craft: "Noken", story: "Dirajut dari serat kulit kayu tanpa alat tenun, Noken dipakai membawa hasil bumi sekaligus simbol kedewasaan perempuan Papua.", image: "./images/nokenpapua.jpg" },
  { id: "papua_asmat", name: "Papua Selatan", x: 93.1, y: 61.7, craft: "Ukiran Asmat", story: "Ukiran suku Asmat memahat silsilah leluhur ke dalam kayu, menjadikan setiap patung sebuah pohon keluarga yang hidup.", image: "./images/ukiranasmatpapua.jpg" },
];

const CRAFTS = [
  { name: "Batik", region: "Jawa", desc: "Cerita yang dilukis dengan malam, goresan demi goresan di atas kain.", image: "./images/batikjawa.jpg" },
  { name: "Wayang Kulit", region: "Jawa & Bali", desc: "Boneka kulit yang membawa epos berusia seribu tahun menembus malam.", image: "./images/wayangkulitjawa.jpg" },
  { name: "Topeng Malangan", region: "Malang", desc: "Topeng ukir yang mengizinkan penari menjelma raja, raksasa, atau badut.", image: "./images/topengmalanganjatim.jpg" },
  { name: "Ukiran Jepara", region: "Jepara", desc: "Kayu jati diukir menjadi relief seindah renda, kerajinan yang membentuk identitas satu kota.", image: "./images/ukiranjepara.jpg" },
  { name: "Tenun Ikat", region: "NTT", desc: "Benang diikat dan diwarnai sebelum ditenun, sehingga pola hidup di dalam benangnya.", image: "./images/tenunikatsikkantt.jpg" },
  { name: "Ulos", region: "Sumatra Utara", desc: "Kain tenun Batak yang diberikan sebagai lambang restu dalam setiap babak kehidupan.", image: "./images/ulossumatrautara.jpg" },
  { name: "Songket", region: "Sumatra & Bali", desc: "Benang emas dan perak ditenun jadi kain yang dulu hanya dikenakan bangsawan.", image: "./images/tenunsongketminangsumbar.jpg" },
  { name: "Ukiran Asmat", region: "Papua", desc: "Pahatan kayu yang menghidupkan silsilah leluhur ke dalam setiap patung.", image: "./images/ukiranasmatpapua.jpg" },
  { name: "Noken", region: "Papua Pegunungan", desc: "Anyaman serat kulit kayu, dirajut tangan tanpa alat tenun sama sekali.", image: "./images/nokenpapua.jpg" },
];

const ARTISANS = [
  {
    name: "Ibu Sulastri", craft: "Batik Tulis", location: "Solo, Jawa Tengah", years: 32,
    story: "Sulastri belajar memegang canting sebelum belajar membaca. Kini sanggarnya melatih dua belas perempuan muda yang dulu mengira batik tak punya masa depan.",
    portrait: "./images/batiktulisjateng.jpg",
    workshop: "./images/batiktulispengrajin.jpg",
  },
  {
    name: "Pak Wayan Sudarsana", craft: "Ukiran Kayu", location: "Ubud, Bali", years: 27,
    story: "Setiap panel yang diukir Wayan diawali doa di pura keluarga. Baginya, ukiran tanpa niat hanyalah hiasan semata.",
    portrait: "./images/ukiranjepara.jpg",
    workshop: "./images/tempatukiran.jpg",
  },
  {
    name: "Ibu Maria Bete", craft: "Tenun Ikat", location: "Sikka, NTT", years: 19,
    story: "Koperasi sebelas penenun milik Maria mewarnai setiap benang dengan akar dan kulit kayu dari kampung mereka sendiri, persis seperti yang diajarkan ibunya.",
    portrait: "./images/tenunikatsikkantt.jpg",
    workshop: "./images/tenunikatpengrajin.jpg",
  },
];

const TIMELINE = [
  { label: "Kapas Mentah", icon: "Leaf" },
  { label: "Pewarna Alami", icon: "Droplet" },
  { label: "Menenun", icon: "Shuffle" },
  { label: "Penyempurnaan", icon: "Sparkles" },
  { label: "Produk Jadi", icon: "Package" },
  { label: "Sampai di Tanganmu", icon: "Truck" },
];

const EXPERIENCES = [
  { title: "Kelas Membatik", place: "Solo", image: "./images/batiktulispengrajin.jpg", video: "https://videos.pexels.com/video-files/30408573/13031910_1440_2560_24fps.mp4" },
  { title: "Tur Desa Virtual", place: "Ubud", image: img("photo-1518548419970-58e3b4079ab2", 900, 700), video: "https://videos.pexels.com/video-files/29781865/12797150_2560_1440_30fps.mp4" },
  { title: "Temu Penenun", place: "Sikka", image: "./images/tenunikatsikkantt.jpg", video: "https://videos.pexels.com/video-files/37810391/16038068_1080_1920_60fps.mp4" },
  { title: "Malam Purnama Budaya", place: "Yogyakarta", image: img("photo-1596402184320-417e7178b2cd", 900, 700), video: "https://videos.pexels.com/video-files/32947306/14041577_1920_1080_25fps.mp4" },
];

const COLLECTION = [
  { name: "Selendang Batik Sekar Jagad", artisan: "Ibu Sulastri", location: "Solo, Jawa Tengah", price: "Rp 1.250.000", tag: "Batik", image: "./images/batiktulisjateng.jpg" },
  { name: "Kain Ulos Ragi Hotang", artisan: "Sanggar Toba", location: "Danau Toba, Sumut", price: "Rp 1.650.000", tag: "Tenun", image: "./images/ulossumatrautara.jpg" },
  { name: "Songket Palembang Limar", artisan: "Sanggar Songket Palembang", location: "Palembang", price: "Rp 4.200.000", tag: "Tenun", image: "./images/songketpalembangsumsel.jpg" },
  { name: "Wayang Kulit Arjuna", artisan: "Ki Slamet", location: "Yogyakarta", price: "Rp 2.100.000", tag: "Wayang", image: "./images/wayangkulitjogja.jpg" },
  { name: "Topeng Malangan Klana", artisan: "Sanggar Topeng Malang", location: "Malang", price: "Rp 1.450.000", tag: "Ukiran", image: "./images/topengmalanganjatim.jpg" },
  { name: "Noken Rajut Wamena", artisan: "Kolektif Mama Papua", location: "Wamena, Papua", price: "Rp 620.000", tag: "Anyaman", image: "./images/nokenpapua.jpg" },
  { name: "Ukiran Asmat Leluhur", artisan: "Sanggar Asmat", location: "Papua Selatan", price: "Rp 5.600.000", tag: "Ukiran", image: "./images/ukiranasmatpapua.jpg" },
  { name: "Batik Mega Mendung Cirebon", artisan: "Sanggar Trusmi", location: "Cirebon, Jawa Barat", price: "Rp 1.100.000", tag: "Batik", image: "./images/batikmegamendungjabar.jpg" },
  { name: "Tenun Songket Sasak", artisan: "Sanggar Sukarara", location: "Lombok, NTB", price: "Rp 1.850.000", tag: "Tenun", image: "./images/tenunsongketsasakntb.jpg" },
  { name: "Hinggi Tenun Ikat Sumba", artisan: "Sanggar Sumba Timur", location: "Sumba, NTT", price: "Rp 3.400.000", tag: "Tenun", image: "./images/tentunikatsumbantt.jpg" },
  { name: "Ukiran Tongkonan Toraja", artisan: "Sanggar Toraja", location: "Tana Toraja, Sulsel", price: "Rp 2.750.000", tag: "Ukiran", image: "./images/tempatukiran.jpg" },
  { name: "Relief Ukir Jepara", artisan: "Sanggar Jepara Jati", location: "Jepara, Jawa Tengah", price: "Rp 3.900.000", tag: "Ukiran", image: "./images/ukiranjepara.jpg" },
  { name: "Sulam Karawo Gorontalo", artisan: "Sanggar Karawo", location: "Gorontalo", price: "Rp 890.000", tag: "Batik", image: "./images/karawogorontalo.jpg" },
  { name: "Kerawang Gayo Emas", artisan: "Sanggar Gayo Lues", location: "Aceh", price: "Rp 1.560.000", tag: "Batik", image: "./images/kerawanggayoaceh.jpg" },
  { name: "Anyaman Rotan Dayak", artisan: "Koperasi Dayak Kalteng", location: "Kalimantan Tengah", price: "Rp 740.000", tag: "Anyaman", image: "./images/anyamanrotandayakkaltim.jpg" },
  { name: "Ukiran Perak Celuk", artisan: "Sanggar Celuk Silver", location: "Ubud, Bali", price: "Rp 2.300.000", tag: "Ukiran", image: "./images/ukiran&perakbali.jpg" },
];

const COLLECTION_TAG_ICON = { Batik: PenTool, Ukiran: Hammer, Tenun: Waves, Wayang: Scroll, Anyaman: Package, Keris: Swords };
const COLLECTION_GRADIENTS = [
  "linear-gradient(150deg, #214E3B 0%, #2E5E48 100%)",
  "linear-gradient(150deg, #C96A3D 0%, #DE8657 100%)",
  "linear-gradient(150deg, #4A2E1E 0%, #6B4530 100%)",
  "linear-gradient(150deg, #C8A25A 0%, #B98A43 100%)",
];

const STATS = [
  { value: 2500, suffix: "+", label: "Artisan Supported" },
  { value: 500, suffix: "+", label: "UMKM Joined" },
  { value: 15000, suffix: "+", label: "Heritage Products Sold" },
  { value: 350, suffix: "+", label: "Workshop Completed" },
];

// Shared hooks & helpers

function useCountUp(target, inView, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (t) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return value;
}

function Reveal({ children, delay = 0, y = 28, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Word-by-word headline reveal
function KineticText({ text, className, style, delay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ ...style, display: "inline" }}>
      {words.map((w, i) => (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.28em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: delay + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// Magnetic hover effect for buttons
function IntroCurtain({ done, setDone }) {
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3200);
    return () => clearTimeout(t);
  }, [setDone]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#214E3B" }}
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="w-64 md:w-96 mb-6">
            <svg viewBox={INDONESIA_VIEWBOX} className="w-full h-auto drop-shadow-2xl">
              <motion.path
                d={INDONESIA_PATH}
                fill="none"
                stroke="#C8A25A"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <g>
                  {/* Tip of PenTool is around bottom-left, adjust x/y to align it with path */}
                  <foreignObject width={32} height={32} x="-4" y="-22" style={{ overflow: 'visible' }}>
                    <PenTool size={24} color="#F8F4EC" strokeWidth={1.5} style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))" }} />
                  </foreignObject>
                  <animateMotion
                    dur="2.5s"
                    repeatCount="1"
                    fill="freeze"
                    calcMode="linear"
                    path={INDONESIA_PATH}
                  />
                </g>
              </motion.g>
            </svg>
          </div>
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
          >
            <p className="font-display text-2xl md:text-3xl tracking-[0.15em] uppercase" style={{ color: "#F8F4EC" }}>
              Cultoura
            </p>
            <p className="font-body text-[10px] md:text-xs tracking-widest mt-2 uppercase" style={{ color: "#C8A25A" }}>
              Every Heritage Has a Future
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Navbar

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === "/";

  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      
      if (onLanding) {
        const sections = ["map", "discover", "artisans", "experience", "collection"];
        let current = "";
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 150) {
            current = "#" + id;
          }
        }
        setActiveHash((prev) => prev !== current ? current : prev);
      }
    };
    
    window.addEventListener("scroll", onScroll);
    onScroll(); // Inisialisasi awal
    return () => window.removeEventListener("scroll", onScroll);
  }, [onLanding]);

  const links = [
    ["Heritage Map", "#map"],
    ["Discover Heritage", "#discover"],
    ["Meet The Artisan", "#artisans"],
    ["Heritage Experience", "#experience"],
    ["Featured Collection", "#collection"],
  ];

  const NavLink = ({ href, children, ...rest }) => {
    const isActive = onLanding && href === activeHash;
    const computedStyle = isActive ? { ...rest.style, color: "#C96A3D", opacity: 1, fontWeight: 500 } : rest.style;

    const handleClick = (e) => {
      if (onLanding && href.startsWith("#")) {
        e.preventDefault();
        const el = document.getElementById(href.substring(1));
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          setTimeout(() => {
            try {
              window.scrollTo({ top: y, behavior: 'smooth' });
            } catch (err) {
              window.scrollTo(0, y);
            }
          }, 50);
        }
      }
      
      // Gunakan pemanggilan fungsi langsung tanpa timeout jika memungkinkan
      if (rest.onClick) {
        rest.onClick();
      }
    };
    return onLanding ? (
      <a href={href} {...rest} style={computedStyle} onClick={handleClick}>{children}</a>
    ) : (
      <Link to={`/${href}`} {...rest} style={computedStyle}>{children}</Link>
    );
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{
        backgroundColor: scrolled || !onLanding ? "rgba(248,244,236,0.85)" : "transparent",
        backdropFilter: scrolled || !onLanding ? "blur(14px)" : "none",
        borderBottom: scrolled || !onLanding ? "1px solid rgba(33,78,59,0.08)" : "1px solid transparent",
      }}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-5">
        <Link to="/" className="font-display text-2xl tracking-tight" style={{ color: "#214E3B" }}>
          Cultoura
        </Link>
        <div className="hidden md:flex items-center gap-9 font-body text-sm" style={{ color: "#214E3B" }}>
          {links.map(([label, href]) => (
            <NavLink key={href} href={href} className="opacity-70 hover:opacity-100 transition-opacity">
              {label}
            </NavLink>
          ))}
        </div>
        
        <button className="md:hidden p-2 -mr-2" onClick={() => setOpen(!open)} style={{ color: "#214E3B" }} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
            style={{ backgroundColor: "#F8F4EC" }}
          >
            <div className="flex flex-col gap-4 px-6 pb-6 font-body text-sm" style={{ color: "#214E3B" }}>
              {links.map(([label, href]) => (
                <NavLink key={href} href={href} className="block py-2 text-base" onClick={() => setOpen(false)}>{label}</NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// Hero section

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative h-screen min-h-[720px] overflow-hidden" style={{ backgroundColor: "#214E3B" }}>
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src={img("photo-1779031242515-205111711b23", 1800, 1400)}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(33,78,59,0.55) 0%, rgba(33,78,59,0.75) 60%, #214E3B 100%)" }} />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <Reveal delay={0.1}>
          <span className="font-body uppercase tracking-[0.3em] text-xs" style={{ color: "#C8A25A" }}>
            Cultoura
          </span>
        </Reveal>
        <h1 className="font-display mt-6 max-w-4xl text-[2.2rem] leading-[1.15] md:text-6xl md:leading-[1.1]" style={{ color: "#F8F4EC" }}>
          <KineticText text="Indonesia Doesn't Need" delay={0.3} />
          <br />
          <KineticText text="New Culture." delay={0.55} />
          <br />
          <span style={{ color: "#C96A3D" }}>
            <KineticText text="It Needs New Ways" delay={0.8} />
            <br />
            <KineticText text="To Preserve It." delay={1.05} />
          </span>
        </h1>
        <Reveal delay={1.4}>
          <p className="font-body mt-2 uppercase tracking-[0.2em] text-xs" style={{ color: "#C8A25A" }}>
            Every Heritage Has a Future.
          </p>
        </Reveal>
        <Reveal delay={1.5}>
          <p className="font-body mt-4 max-w-xl text-base md:text-lg" style={{ color: "rgba(248,244,236,0.8)" }}>
            Setiap motif, topeng, dan helai benang menyimpan cerita. Cultoura menghubungkanmu dengan para perajin yang menjaganya tetap hidup — satu warisan pada satu waktu.
          </p>
        </Reveal>
        <Reveal delay={1.65}>
          
        </Reveal>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        <ArrowDown size={20} color="#F8F4EC" opacity={0.7} />
      </motion.div>
    </section>
  );
}

// Heritage map section

function HeritageMap() {
  const [active, setActive] = useState(REGIONS[0]);
  const [zoomedRegion, setZoomedRegion] = useState(null);

  return (
    <section id="map" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Heritage Map</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
            Seribu Pulau, Setiap Pulau Menyimpan Kerajinan.
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-10 mt-14 items-center">
          <Reveal delay={0.1} className="md:col-span-3 relative rounded-3xl">
            <div className="relative overflow-hidden rounded-3xl" style={{ backgroundColor: "#EDE6D6" }}>
              <motion.div 
                className="relative aspect-[1000/460]"
                animate={{ scale: zoomedRegion ? 1.35 : 1 }}
                style={{ transformOrigin: `${active.x}% ${active.y}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg viewBox={INDONESIA_VIEWBOX} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
                  <path d={INDONESIA_PATH} fill={UMBER} fillOpacity={0.16} stroke={UMBER} strokeOpacity={0.55} strokeWidth={0.8} />
                </svg>
                {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onMouseEnter={() => { if (!zoomedRegion) setActive(r) }}
                  onClick={() => {
                    setActive(r);
                    setZoomedRegion(r);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${r.x}%`, top: `${r.y}%`, zIndex: active.id === r.id ? 10 : 1 }}
                  aria-label={r.name}
                  
                >
                  <motion.span
                    className="block rounded-full"
                    style={{
                      width: active.id === r.id ? 14 : 7,
                      height: active.id === r.id ? 14 : 7,
                      backgroundColor: active.id === r.id ? "#C96A3D" : UMBER,
                      boxShadow: "0 0 0 2px rgba(248,244,236,0.9)",
                    }}
                    animate={active.id === r.id ? { scale: [1, 1.35, 1] } : {}}
                    transition={{ repeat: active.id === r.id ? Infinity : 0, duration: 1.6 }}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap font-body text-[11px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: UMBER, color: "#F8F4EC", zIndex: 20 }}
                  >
                    {r.name}
                  </span>
                </button>
              ))}
              </motion.div>

              {/* Overlay Modal (Polaroid) */}
              <AnimatePresence>
                {zoomedRegion && (
                  <motion.div 
                    className="fixed inset-0 z-[9999] md:absolute md:inset-0 md:z-50 flex items-center justify-center bg-black/60 md:bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setZoomedRegion(null)}
                  >
                    <motion.div 
                      className="p-3 md:p-2.5 rounded-xl shadow-2xl max-w-[280px] md:max-w-[230px] w-full mx-4 cursor-default"
                      style={{ backgroundColor: "#FFFDF9" }}
                      initial={{ scale: 0.8, y: 20, rotate: -2 }}
                      animate={{ scale: 1, y: 0, rotate: 0 }}
                      exit={{ scale: 0.8, y: 20, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img src={zoomedRegion.image} alt={zoomedRegion.craft} className="w-full h-40 md:h-28 object-cover rounded-lg" />
                      <div className="mt-3 px-1">
                        <div className="flex items-center gap-1 font-body text-[10px] uppercase tracking-wider" style={{ color: "#C96A3D" }}>
                          <MapPin size={11} /> {zoomedRegion.name}
                        </div>
                        <h3 className="font-display text-xl md:text-lg mt-1 leading-tight" style={{ color: "#214E3B" }}>{zoomedRegion.craft}</h3>
                        <p className="font-body text-xs md:text-[10px] leading-relaxed mt-2 line-clamp-3" style={{ color: "rgba(33,78,59,0.75)" }}>
                          {zoomedRegion.story}
                        </p>
                        <button 
                          className="mt-4 w-full py-2.5 rounded-full font-body text-xs font-semibold tracking-wide transition-transform hover:scale-105 active:scale-95"
                          style={{ backgroundColor: "#214E3B", color: "#F8F4EC" }}
                          onClick={() => setZoomedRegion(null)}
                        >
                          Tutup Peta
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="font-body text-[11px] mt-3 text-center" style={{ color: "rgba(33,78,59,0.45)" }}>
              20 titik kerajinan dari Aceh hingga Papua — arahkan kursor atau ketuk untuk menjelajah.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="md:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "#FFFDF9", border: "1px solid rgba(33,78,59,0.1)" }}
              >
                <img src={active.image} alt={active.craft} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-2 font-body text-xs" style={{ color: "#C96A3D" }}>
                    <MapPin size={13} /> {active.name}
                  </div>
                  <h3 className="font-display text-2xl mt-2" style={{ color: "#214E3B" }}>{active.craft}</h3>
                  <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: "rgba(33,78,59,0.75)" }}>
                    {active.story}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Discover heritage section

function DiscoverHeritage() {
  const [hovered, setHovered] = useState(null);
  return (
    <section id="discover" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#214E3B" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C8A25A" }}>Discover Heritage</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#F8F4EC" }}>
            Enam Kerajinan, Enam Abad Ketekunan.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {CRAFTS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.08}>
              <motion.div
                
                
                onHoverStart={() => { if (window.matchMedia('(hover: hover)').matches) setHovered(c.name) }}
                onHoverEnd={() => { if (window.matchMedia('(hover: hover)').matches) setHovered(null) }}
                onClick={() => setHovered(hovered === c.name ? null : c.name)}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{ height: 380 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={c.image}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  animate={{ scale: hovered === c.name ? 1.08 : 1 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(33,78,59,0) 40%, rgba(38,26,17,0.94) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-body text-[11px] uppercase tracking-widest" style={{ color: "#C8A25A" }}>{c.region}</p>
                  <h3 className="font-display text-2xl mt-1" style={{ color: "#F8F4EC" }}>{c.name}</h3>
                  <motion.p
                    className="font-body text-sm mt-2 overflow-hidden"
                    style={{ color: "rgba(248,244,236,0.85)" }}
                    animate={{ height: hovered === c.name ? "auto" : 0, opacity: hovered === c.name ? 1 : 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    {c.desc}
                  </motion.p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Meet the artisan section

function MeetArtisan() {
  const scrollerRef = useRef(null);
  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 640), behavior: "smooth" });
  };

  return (
    <section id="artisans" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Meet The Artisan</span>
              <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
                Tangan yang Membawa Tradisi Melangkah Maju.
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Sebelumnya"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ border: `1px solid ${UMBER}55`, color: UMBER }}
              >
                <ArrowRight size={16} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Berikutnya"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#214E3B", color: "#F8F4EC" }}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            ref={scrollerRef}
            className="flex gap-8 mt-14 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 -mx-6 px-6 md:mx-0 md:px-0"
            style={{ scrollbarWidth: "thin" }}
          >
            {ARTISANS.map((a) => (
              <div
                key={a.name}
                className="snap-start shrink-0 w-[86vw] sm:w-[560px] lg:w-[640px] grid sm:grid-cols-12 gap-6 items-center rounded-3xl p-5 sm:p-6"
                style={{ backgroundColor: "#FFFDF9", border: `1px solid ${UMBER}22` }}
              >
                <div className="sm:col-span-5 relative">
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
                    <img src={a.portrait} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <div
                    className="hidden sm:block absolute -bottom-6 -right-6 rounded-2xl overflow-hidden shadow-xl"
                    style={{ width: 130, height: 95, border: "5px solid #FFFDF9" }}
                  >
                    <img src={a.workshop} alt="sanggar kerja" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="sm:col-span-7">
                  <p className="font-body text-xs uppercase tracking-widest" style={{ color: "#C96A3D" }}>{a.craft} · {a.years} tahun menekuni</p>
                  <h3 className="font-display text-2xl lg:text-3xl mt-3" style={{ color: "#214E3B" }}>{a.name}</h3>
                  <div className="flex items-center gap-1.5 font-body text-sm mt-2" style={{ color: "rgba(33,78,59,0.6)" }}>
                    <MapPin size={14} /> {a.location}
                  </div>
                  <p className="font-body mt-4 text-sm leading-relaxed" style={{ color: "rgba(33,78,59,0.8)" }}>
                    {a.story}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="font-body text-[11px] mt-1 sm:hidden" style={{ color: "rgba(33,78,59,0.45)" }}>
          Geser untuk melihat pengrajin lainnya →
        </p>
      </div>
    </section>
  );
}

// Story behind every product section

const TIMELINE_ICONS = { Leaf, Droplet, Shuffle, Sparkles, Package, Truck };

function StoryTimeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <div ref={ref} className="relative h-[300vh] w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] my-10">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-[#EDE6D6]">
        <motion.div style={{ x }} className="flex w-[400vw]">
          {TIMELINE.map((step, i) => {
            const Icon = TIMELINE_ICONS[step.icon];
            const isLast = i === TIMELINE.length - 1;
            return (
              <div 
                key={step.label} 
                className="w-screen flex-shrink-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-8 md:gap-16"
              >
                <div 
                  className="w-40 h-40 md:w-64 md:h-64 rounded-full flex items-center justify-center shadow-xl relative z-10 transition-transform hover:scale-105"
                  style={{ backgroundColor: isLast ? "#C96A3D" : "#F8F4EC", border: `2px solid ${isLast ? "#C96A3D" : "rgba(33,78,59,0.2)"}` }}
                >
                  <Icon size={isLast ? 72 : 64} color={isLast ? "#F8F4EC" : "#214E3B"} strokeWidth={1} />
                </div>
                <div className="text-center md:text-left max-w-lg">
                  <span className="font-body text-xs md:text-sm uppercase tracking-widest font-semibold" style={{ color: "#C96A3D" }}>Tahap {i + 1}</span>
                  <p className="font-display text-4xl md:text-6xl mt-2 mb-4" style={{ color: "#214E3B" }}>{step.label.replace(/^\d+\.\s*/, '')}</p>
                  <p className="font-body text-lg md:text-2xl leading-relaxed" style={{ color: "rgba(33,78,59,0.75)" }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function WeavingIllustration() {
  return (
    <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
      <img
        src="./images/tenunikatsikkantt.jpg"
        alt="Proses menenun"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(20,40,32,0.75) 0%, rgba(20,40,32,0) 45%)" }} />
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <span className="font-body text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(248,244,236,0.12)", border: "1px solid rgba(248,244,236,0.3)", color: "#F8F4EC" }}>
          <MapPin size={12} /> Sikka, NTT
        </span>
        <span className="font-body text-xs" style={{ color: "rgba(248,244,236,0.7)" }}>Proses Menenun</span>
      </div>
    </div>
  );
}

function StoryBehindProduct() {
  return (
    <section className="py-28 px-6 md:px-10" style={{ backgroundColor: "#EDE6D6" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Story Behind Every Product</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
            Cerita di Balik Setiap Produk.
          </h2>
        </Reveal>

        <div className="mt-16 md:mt-24">
          <StoryTimeline />
        </div>

        <div className="grid md:grid-cols-2 gap-10 mt-20 items-start">
          <Reveal>
            <WeavingIllustration />
            <div className="mt-6 pl-5 relative">
              <Quote size={22} color="#C96A3D" className="absolute -left-0.5 top-0" style={{ opacity: 0.5 }} />
              <p className="font-display italic text-lg pl-6" style={{ color: "#214E3B" }}>
                "Setiap ikatan benang adalah doa yang kami ucapkan sebelum ditenun."
              </p>
              <p className="font-body text-xs mt-2 pl-6" style={{ color: "rgba(33,78,59,0.6)" }}>— Ibu Maria Bete, Penenun</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-display text-2xl" style={{ color: "#214E3B" }}>Selendang Ikat Sikka</h3>
            <p className="font-body text-sm mt-3 leading-relaxed" style={{ color: "rgba(33,78,59,0.8)" }}>
              Sebelum satu benang pun ditenun, ia diikat dan diwarnai dengan tangan — teknik yang mengunci pola langsung ke dalam benangnya, berminggu-minggu sebelum alat tenun disentuh.
            </p>

            <div className="mt-8 rounded-2xl p-6" style={{ backgroundColor: "#F8F4EC", border: "1px solid rgba(33,78,59,0.12)" }}>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={16} color="#C8A25A" />
                <p className="font-body text-xs uppercase tracking-widest" style={{ color: "#214E3B" }}>Digital Product Passport</p>
              </div>
              <div className="flex flex-col divide-y" style={{ borderColor: "rgba(33,78,59,0.1)" }}>
                {[
                  [MapPin, "Asal", "Sikka, NTT"],
                  [Users, "Perajin", "Ibu Maria Bete"],
                  [Layers, "Material", "Katun pintal tangan, pewarna akar"],
                  [Heart, "Makna", "Perlindungan & garis keturunan"],
                  [Leaf, "Dampak Lingkungan", "Nol pewarna sintetis"],
                  [Globe2, "Dampak Sosial", "11 penenun diberdayakan"],
                ].map(([Icon, k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-3 font-body text-sm">
                    <span className="flex items-center gap-2" style={{ color: "rgba(33,78,59,0.55)" }}>
                      <Icon size={14} color="#C96A3D" /> {k}
                    </span>
                    <span className="text-right" style={{ color: "#214E3B" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Heritage experience section

function ExperienceCard({ e }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const handleEnter = () => {
    setHovered(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
  const handleLeave = () => {
    setHovered(false);
    const v = videoRef.current;
    if (v) v.pause();
  };

  return (
    <div
      
      className="group relative rounded-2xl overflow-hidden"
      style={{ aspectRatio: "3/4" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <img
        src={e.image}
        alt={e.title}
        loading="lazy"
        onError={(ev) => { ev.currentTarget.style.opacity = 0; ev.currentTarget.parentElement.style.backgroundColor = "#4A2E1E"; }}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: hovered && videoReady ? 0 : 1 }}
      />
      {e.video && (
        <video
          ref={videoRef}
          src={e.video}
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setVideoReady(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: hovered && videoReady ? 1 : 0 }}
        />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(33,78,59,0) 45%, rgba(38,26,17,0.92) 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-body text-[11px] uppercase tracking-widest" style={{ color: "#C8A25A" }}>{e.place}</p>
        <h3 className="font-display text-xl mt-1" style={{ color: "#F8F4EC" }}>{e.title}</h3>
      </div>
      <div className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300" style={{ backgroundColor: "rgba(248,244,236,0.9)", transform: hovered ? "scale(0.85)" : "scale(1)" }}>
        <Play size={13} color="#214E3B" fill="#214E3B" />
      </div>
    </div>
  );
}

function HeritageExperience() {
  return (
    <section id="experience" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Heritage Experience</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
            Masuk ke Dalam Cerita, Bukan Sekadar Etalase.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {EXPERIENCES.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.08}>
              <ExperienceCard e={e} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Impact section

function Impact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-28 px-6 md:px-10" style={{ backgroundColor: "#214E3B" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C8A25A" }}>Cultoura Impact</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#F8F4EC" }}>
            Budaya Terjaga, Penghidupan Berkelanjutan.
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {STATS.map((s, i) => (
            <StatCard key={s.label} stat={s} inView={inView} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, inView, delay }) {
  const count = useCountUp(stat.value, inView);
  return (
    <Reveal delay={delay}>
      <div className="border-t pt-6" style={{ borderColor: "rgba(248,244,236,0.2)" }}>
        <p className="font-display text-3xl md:text-5xl" style={{ color: "#C96A3D" }}>
          {count.toLocaleString("id-ID")}{stat.suffix}
        </p>
        <p className="font-body text-sm mt-2" style={{ color: "rgba(248,244,236,0.75)" }}>{stat.label}</p>
      </div>
    </Reveal>
  );
}

function StatCardLight({ stat, inView, delay }) {
  const count = useCountUp(stat.value, inView);
  return (
    <Reveal delay={delay}>
      <div className="border-t pt-6" style={{ borderColor: "rgba(33,78,59,0.15)" }}>
        <p className="font-display text-3xl md:text-5xl" style={{ color: "#C96A3D" }}>
          {count.toLocaleString("id-ID")}{stat.suffix}
        </p>
        <p className="font-body text-sm mt-2" style={{ color: "rgba(33,78,59,0.7)" }}>{stat.label}</p>
      </div>
    </Reveal>
  );
}

// Featured collection section

function ProductTile({ p, index, hovered, setHovered }) {
  const Icon = COLLECTION_TAG_ICON[p.tag] || Sparkles;
  const bg = COLLECTION_GRADIENTS[index % COLLECTION_GRADIENTS.length];
  return (
    <div
      
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ aspectRatio: "3/4", background: bg }}
      onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches) setHovered(p.name) }}
      onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) setHovered(null) }}
      onClick={() => setHovered(hovered === p.name ? null : p.name)}
    >
      {p.image && (
        <motion.img
          src={p.image}
          alt={p.name}
          animate={{ scale: hovered === p.name ? 1.08 : 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {!p.image && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.14]" preserveAspectRatio="none">
            <defs>
              <pattern id={`ptile-${index}`} width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
                <circle cx="3" cy="3" r="1.4" fill="#F8F4EC" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#ptile-${index})`} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon size={54} color="#F8F4EC" strokeWidth={1.2} />
          </div>
        </>
      )}

      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,14,9,0.15) 40%, rgba(20,14,9,0.9) 100%)" }} />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="font-body text-[10px] uppercase tracking-widest" style={{ color: "rgba(248,244,236,0.65)" }}>{p.tag} · {p.location}</p>
        <p className="font-display text-base mt-1" style={{ color: "#F8F4EC" }}>{p.name}</p>
        <p className="font-body text-xs mt-1" style={{ color: "rgba(248,244,236,0.7)" }}>oleh {p.artisan}</p>
        <AnimatePresence>
          {hovered === p.name && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="font-body text-sm mt-2"
              style={{ color: "#C8A25A" }}
            >
              {p.price}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeaturedCollection() {
  const [hovered, setHovered] = useState(null);
  const visible = COLLECTION.slice(0, 8);

  return (
    <section id="collection" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Featured Collection</span>
          <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
            Karya yang Layak Ditemani Seumur Hidup.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
          {visible.map((p, i) => (
            <Reveal key={p.name} delay={(i % 4) * 0.05}>
              <ProductTile p={p} index={i} hovered={hovered} setHovered={setHovered} />
            </Reveal>
          ))}
        </div>

        {COLLECTION.length > 8 && (
          <Reveal delay={0.1} className="flex justify-center mt-14">
            
          </Reveal>
        )}
      </div>
    </section>
  );
}

// Join the preservation section

function JoinPreservation() {
  return (
    <section id="preserve" className="relative py-32 px-6 md:px-10 overflow-hidden" style={{ backgroundColor: "#214E3B" }}>
      <svg className="absolute -bottom-24 -left-24 opacity-[0.06]" width="420" height="420" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#C8A25A" strokeWidth="1" />
      </svg>
      <svg className="absolute -top-16 -right-16 opacity-[0.05]" width="320" height="320" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke={UMBER} strokeWidth="1" />
      </svg>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <Reveal>
          <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C8A25A" }}>Join The Preservation</span>
          <Heart size={28} color="#C96A3D" className="mx-auto mt-5" />
          <h2 className="font-display text-3xl md:text-5xl mt-6 leading-tight" style={{ color: "#F8F4EC" }}>
            Beli Lokal. Dukung Perajin. Jaga Warisan.
          </h2>
          <p className="font-body mt-6 text-base max-w-xl mx-auto" style={{ color: "rgba(248,244,236,0.75)" }}>
            Setiap pembelian di Cultoura mendanai lokakarya, melatih penerus, dan menjaga sebuah kerajinan agar tak punah.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-9 font-body text-xs">
            {[
              [ShoppingBag, "Buy Heritage Product"],
              [Ticket, "Join Experience & Workshop"],
              [HandHeart, "Support Artisan / Donate"],
            ].map(([Icon, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{ backgroundColor: "rgba(248,244,236,0.08)", border: "1px solid rgba(248,244,236,0.25)", color: "#F8F4EC" }}
              >
                <Icon size={13} color="#C8A25A" /> {label}
              </span>
            ))}
          </div>

          
        </Reveal>
      </div>
    </section>
  );
}

// Footer

// Renders a link that scrolls in-page if already on the target route,
// or navigates + scrolls if coming from elsewhere.
function FooterLink({ path, hash, external, children }) {
  const location = useLocation();
  const className = "transition-colors";
  const hoverStyle = { color: "rgba(33,78,59,0.7)" };

  if (external) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={hoverStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C96A3D")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(33,78,59,0.7)")}
      >
        {children}
      </a>
    );
  }

  const onSamePage = location.pathname === path;
  const commonProps = {
    className,
    style: hoverStyle,
    onMouseEnter: (e) => (e.currentTarget.style.color = "#C96A3D"),
    onMouseLeave: (e) => (e.currentTarget.style.color = "rgba(33,78,59,0.7)"),
  };

  const handleClick = (e) => {
    if (onSamePage && hash) {
      e.preventDefault();
      const el = document.getElementById(hash.substring(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return onSamePage ? (
    <a href={hash} onClick={handleClick} {...commonProps}>{children}</a>
  ) : (
    <Link to={`${path}${hash || ""}`} {...commonProps}>{children}</Link>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Quick Links",
    items: [
      { label: "Heritage Map", path: "/", hash: "#map" },
      { label: "Discover Heritage", path: "/", hash: "#discover" },
      { label: "Meet The Artisan", path: "/", hash: "#artisans" },
      { label: "Heritage Experience", path: "/", hash: "#experience" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Kisah Kami", path: "/tentang-kami", hash: "#kisah-kami" },
      { label: "Dampak Kami", path: "/tentang-kami", hash: "#dampak-kami" },
      { label: "Karier", path: "/tentang-kami", hash: "#karier" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "hello@cultoura.id", path: "mailto:hello@cultoura.id", external: true },
      { label: "Instagram", path: "https://instagram.com/cultoura.id", external: true },
      { label: "TikTok", path: "https://tiktok.com/@cultoura.id", external: true },
      { label: "YouTube", path: "https://youtube.com/@cultoura.id", external: true },
    ],
  },
];

function Footer() {
  return (
    <footer className="py-16 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC", borderTop: `1px solid ${UMBER}33` }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-display text-2xl inline-block" style={{ color: "#214E3B" }}>Cultoura</Link>
          <p className="font-body text-sm mt-3" style={{ color: "rgba(33,78,59,0.6)" }}>Every Heritage Has a Future.</p>
        </div>
        {FOOTER_COLUMNS.map(({ title, items }) => (
          <div key={title}>
            <p className="font-body text-xs uppercase tracking-widest" style={{ color: "#C96A3D" }}>{title}</p>
            <ul className="mt-4 space-y-2 font-body text-sm" style={{ color: "rgba(33,78,59,0.7)" }}>
              {items.map((it) => (
                <li key={it.label}>
                  <FooterLink path={it.path} hash={it.hash} external={it.external}>{it.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-6 font-body text-xs" style={{ borderTop: "1px solid rgba(33,78,59,0.1)", color: "rgba(33,78,59,0.5)" }}>
        © 2026 Cultoura. Menjaga warisan Indonesia, satu cerita pada satu waktu.
      </div>
    </footer>
  );
}

// Shared page shell

function Layout({ children }) {
  return (
    <div className="font-body cultoura-root" style={{ backgroundColor: "#F8F4EC" }}>
      <style>{FONTS}</style>
      
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

// Landing page

function LandingPage() {
  const [introDone, setIntroDone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
        return () => clearTimeout(t);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <Layout>
      <IntroCurtain done={introDone} setDone={setIntroDone} />
      <Hero />
      <HeritageMap />
      <DiscoverHeritage />
      <MeetArtisan />
      <StoryBehindProduct />
      <HeritageExperience />
      <Impact />
      <FeaturedCollection />
      <JoinPreservation />
    </Layout>
  );
}

// Full catalog page

function CollectionPage() {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <section className="pt-36 md:pt-40 pb-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="mb-10">
              <Link
                to="/"
                className="font-body inline-flex items-center gap-2 text-sm"
                style={{ color: "rgba(33,78,59,0.65)" }}
              >
                <ArrowLeft size={15} /> Kembali ke Beranda
              </Link>
            </div>
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Full Catalog</span>
            <h1 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
              Seluruh Koleksi Cultoura.
            </h1>
            <p className="font-body text-sm md:text-base mt-4 max-w-xl" style={{ color: "rgba(33,78,59,0.7)" }}>
              {COLLECTION.length} karya dari perajin di seluruh Nusantara, dari Sumatra sampai Papua — setiap satu membawa cerita dan penghidupan bagi pembuatnya.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {COLLECTION.map((p, i) => (
              <Reveal key={p.name} delay={(i % 4) * 0.05}>
                <ProductTile p={p} index={i} hovered={hovered} setHovered={setHovered} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

// About page — Kisah Kami / Dampak Kami / Karier

function AboutPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
        return () => clearTimeout(t);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const impactRef = useRef(null);
  const impactInView = useInView(impactRef, { once: true, margin: "-100px" });

  return (
    <Layout>
      {/* Hero */}
      <section id="kisah-kami" className="pt-40 pb-28 px-6 md:px-10 relative overflow-hidden" style={{ backgroundColor: "#214E3B" }}>
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <defs>
            <pattern id="about-pattern" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="17" cy="17" r="1.6" fill="#C8A25A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-pattern)" />
        </svg>
        <div className="max-w-4xl mx-auto relative">
          <Reveal>
            <div className="mb-10">
              <Link
                to="/"
                className="font-body inline-flex items-center gap-2 text-sm"
                style={{ color: "rgba(248,244,236,0.65)" }}
              >
                <ArrowLeft size={15} /> Kembali ke Beranda
              </Link>
            </div>
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C8A25A" }}>Kisah Kami</span>
            <h1 className="font-display text-4xl md:text-6xl mt-4" style={{ color: "#F8F4EC" }}>
              Setiap Warisan, Punya Masa Depan.
            </h1>
            <p className="font-display italic text-lg md:text-xl mt-5" style={{ color: "#C8A25A" }}>
              Every Heritage Has a Future.
            </p>
          </Reveal>

          <div className="mt-12 space-y-6 font-body text-sm md:text-base leading-relaxed" style={{ color: "rgba(248,244,236,0.82)" }}>
            <Reveal delay={0.1}>
              <p>
                Cultoura adalah platform digital yang dirancang untuk mendukung pelestarian budaya Indonesia melalui pendekatan modern yang menggabungkan edukasi, storytelling, dan perdagangan produk budaya dalam satu pengalaman digital.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <p>
                Website ini tidak hanya berfungsi sebagai media untuk membeli produk budaya, tetapi juga menjadi ruang eksplorasi yang memperkenalkan kekayaan budaya Indonesia beserta cerita di balik setiap karya. Pengguna diajak menjelajahi berbagai warisan budaya melalui peta interaktif, mengenal para pengrajin lokal, memahami filosofi dan proses pembuatan produk, hingga berpartisipasi dalam pelestarian budaya melalui pembelian produk maupun pengalaman budaya seperti workshop dan virtual tour.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <p>
                Berbeda dari marketplace konvensional yang berfokus pada transaksi, Cultoura menerapkan konsep <span className="italic">Experience Before Purchase</span> — memberikan pengalaman mengenal produk terlebih dahulu sebelum pengguna memutuskan untuk membeli. Dengan pendekatan ini, setiap produk budaya tidak hanya dipandang sebagai barang, tetapi juga sebagai representasi identitas, nilai, dan warisan budaya Indonesia.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <p>
                Melalui konsep tersebut, Cultoura berharap dapat menjadi jembatan antara masyarakat, pengrajin lokal, dan warisan budaya Indonesia — agar budaya tetap relevan, dikenal, dan lestari di era digital.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Dampak Kami */}
      <section id="dampak-kami" ref={impactRef} className="py-28 px-6 md:px-10" style={{ backgroundColor: "#F8F4EC" }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C96A3D" }}>Dampak Kami</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4 max-w-2xl" style={{ color: "#214E3B" }}>
              Budaya Terjaga, Penghidupan Berkelanjutan.
            </h2>
            <p className="font-body text-sm md:text-base mt-4 max-w-xl" style={{ color: "rgba(33,78,59,0.7)" }}>
              Setiap kunjungan, cerita yang dibaca, dan produk yang dibeli di Cultoura mengalir kembali ke pengrajin dan komunitas budaya di seluruh Nusantara.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {STATS.map((s, i) => (
              <StatCardLight key={s.label} stat={s} inView={impactInView} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Karier */}
      <section id="karier" className="py-28 px-6 md:px-10" style={{ backgroundColor: "#214E3B" }}>
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <span className="font-body uppercase tracking-[0.25em] text-xs" style={{ color: "#C8A25A" }}>Karier</span>
            <h2 className="font-display text-3xl md:text-5xl mt-4" style={{ color: "#F8F4EC" }}>
              Bangun Masa Depan Budaya Indonesia Bersama Kami.
            </h2>
            <p className="font-body text-sm md:text-base mt-5 max-w-2xl mx-auto" style={{ color: "rgba(248,244,236,0.75)" }}>
              Cultoura terus bertumbuh bersama para pengrajin, kreator, dan pencerita budaya. Jika kamu ingin ikut menjaga warisan Indonesia lewat teknologi dan cerita, kirimkan perkenalan singkatmu — kami senang mendengarnya.
            </p>
            
          </Reveal>
        </div>
      </section>
    </Layout>
  );
}

// App

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/koleksi" element={<CollectionPage />} />
      <Route path="/tentang-kami" element={<AboutPage />} />
    </Routes>
  );
}
