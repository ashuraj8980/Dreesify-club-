import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product)).filter(p => p.isTrending).slice(0, 6);
        
        // If no products, we'll show empty or fallback
        setTrendingProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { name: 'The Women\'s Archive', image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2070&auto=format&fit=crop', link: '/category/women' },
    { name: 'Curated for Him', image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2070&auto=format&fit=crop', link: '/category/men' },
    { name: 'The Junior Edit', image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=2072&auto=format&fit=crop', link: '/category/kids' },
    { name: 'Modern Objets', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=2070&auto=format&fit=crop', link: '/category/accessories' },
  ];

  return (
    <div className="space-y-40 pb-40">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden flex items-center bg-brand-black">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 2.5, ease: [0.19, 1, 0.22, 1] }}
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover grayscale brightness-75"
          />
        </div>
        
        <div className="container mx-auto px-4 lg:px-12 relative z-10 text-white">
          <div className="max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="overflow-hidden mb-6">
                <motion.span 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="font-display uppercase tracking-[0.6em] text-[9px] block text-brand-gold"
                >
                  Étude Series // Collection ‘26
                </motion.span>
              </div>
              
              <h1 className="text-8xl md:text-[14rem] font-display font-medium leading-[0.75] mb-12 tracking-[-0.05em] lg:indent-[-0.05em]">
                POETRY <br />
                <span className="ml-0 md:ml-48 lg:ml-72 italic font-serif lowercase tracking-tight text-brand-beige">of the self.</span>
              </h1>
              
              <div className="flex flex-col md:flex-row items-end justify-between gap-16 mt-24">
                <div className="max-w-md border-l border-white/10 pl-10">
                  <p className="text-base text-brand-beige/60 font-light tracking-wide leading-relaxed italic font-serif">
                    "Dressify explores the intersection of architectural geometry and the visceral experience of textile."
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mt-4">Manifesto Entry 0.1</p>
                </div>
                <div className="flex gap-6">
                  <Link to="/category/women" className="luxury-button">
                    The Women's Archive
                  </Link>
                  <Link to="/category/men" className="luxury-button-outline !border-white/20 !text-white hover:!bg-white hover:!text-brand-black">
                    Curated for Him
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center space-y-6">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-brand-gold to-transparent" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-black text-brand-gold vertical-text rotate-180">Sequence One</span>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="container mx-auto px-4 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-32 items-center">
          <div className="lg:w-1/2 relative">
             <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 1.2 }}
               className="aspect-[4/5] overflow-hidden grayscale group"
             >
                <img 
                  src="https://images.unsplash.com/photo-1539109136881-3be0610931c3?q=80&w=1920&auto=format&fit=crop" 
                  alt="Editorial" 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
             </motion.div>
             <div className="absolute -bottom-12 -right-12 w-1/2 aspect-square border border-brand-black/5 bg-brand-beige p-12 hidden lg:block shadow-2xl">
                <span className="text-brand-gold text-[8px] font-black uppercase tracking-[0.6em] mb-4 block">Note 01</span>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-loose text-brand-black">
                  "Sustainable practice is not a choice, it is our unwavering commitment to the future of craftsmanship."
                </p>
             </div>
          </div>
          <div className="lg:w-1/2 space-y-12">
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-gold">Epilogue</span>
            <h2 className="text-6xl md:text-9xl font-display leading-[0.8] tracking-tighter uppercase">Quiet <br /> Power</h2>
            <div className="space-y-10 max-w-sm">
               <p className="text-lg text-brand-black/40 font-serif italic italic leading-relaxed">The Archive represents a collection of essential forms, distilled to their absolute necessity.</p>
               <div className="flex items-center gap-10">
                 <Link to="/category/women" className="luxury-button !px-16">The Women</Link>
                 <Link to="/category/men" className="nav-link !text-[11px]">View Men</Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Featured Section */}
      <section className="py-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
           {/* Women Featured */}
           <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="h-[80vh] relative group overflow-hidden"
           >
              <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop" 
                alt="Women Feature" 
                className="w-full h-full object-cover grayscale transition-transform duration-[4s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/20 transition-all duration-1000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-brand-gold text-[10px] font-black uppercase tracking-[0.8em] mb-6 block"
                >
                  Nuance
                </motion.span>
                <h3 className="text-6xl md:text-8xl text-white font-display uppercase tracking-tight mb-12">Feminine <br /> <span className="italic font-serif lowercase text-brand-beige">Structure</span></h3>
                <Link to="/category/women" className="luxury-button !bg-white !text-brand-black hover:!bg-brand-gold">Discover Women</Link>
              </div>
           </motion.div>

           {/* Men Featured */}
           <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="h-[80vh] relative group overflow-hidden"
           >
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000&auto=format&fit=crop" 
                alt="Men Feature" 
                className="w-full h-full object-cover grayscale transition-transform duration-[4s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/20 transition-all duration-1000" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-brand-gold text-[10px] font-black uppercase tracking-[0.8em] mb-6 block"
                >
                  Distinction
                </motion.span>
                <h3 className="text-6xl md:text-8xl text-white font-display uppercase tracking-tight mb-12">Masculine <br /> <span className="italic font-serif lowercase text-brand-beige">Form</span></h3>
                <Link to="/category/men" className="luxury-button !bg-white !text-brand-black hover:!bg-brand-gold">Discover Men</Link>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Trending Pieces */}
      <section className="container mx-auto px-4 lg:px-12">
        <header className="flex flex-col md:flex-row items-end justify-between mb-32 gap-12 border-b border-brand-black/10 pb-16">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-brand-gold block">The Gallery</span>
              <div className="w-12 h-px bg-brand-gold/30" />
            </div>
            <h2 className="text-7xl md:text-[10rem] font-display font-medium leading-[0.8] tracking-tighter uppercase">Artifacts</h2>
          </div>
          <div className="text-right">
             <Link to="/search" className="nav-link !text-[12px] underline underline-offset-8">Explore All</Link>
          </div>
        </header>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse space-y-8">
                <div className="aspect-[3/4] bg-brand-beige/20" />
                <div className="h-6 bg-brand-beige/20 w-3/4" />
                <div className="h-4 bg-brand-beige/10 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {trendingProducts.length > 0 ? (
              trendingProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-60 text-center border-y border-brand-black/5">
                <p className="font-serif italic text-3xl text-brand-black/20 mb-12 uppercase tracking-widest">The archive is currently void.</p>
                <InitializeButton />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Philosophy Section */}
      <section className="bg-brand-black text-white py-40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-30 select-none pointer-events-none hidden lg:block">
           <span className="text-[20rem] font-display font-black leading-none opacity-10 absolute -right-20 top-1/2 -translate-y-1/2">D.</span>
        </div>
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-7xl font-display mb-12 leading-tight tracking-tight">
              Crafted for the <br />
              <span className="italic font-serif lowercase text-brand-gold">Conscious</span> individual.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-brand-beige/60 text-sm leading-relaxed">
              <p>
                Dressify is a contemporary fashion house built on the principles of architectural simplicity, ethical craftsmanship, and unwavering quality. Every piece in our collection is a testament to the beauty of restraint.
              </p>
              <p>
                We collaborate with heritage mills and innovative craftsmen to ensure that your wardrobe is not just a collection of garments, but a permanent archive of exceptional design.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-32 border-t border-white/10 pt-20">
            {[
              { icon: <Truck className="w-6 h-6" />, title: 'GLOBAL DELIVERY', desc: 'Complimentary shipping on orders over ₹10,000' },
              { icon: <ShieldCheck className="w-6 h-6" />, title: 'SECURE ARCHIVE', desc: 'Encrypted end-to-end commerce' },
              { icon: <RefreshCw className="w-6 h-6" />, title: 'THE RETURN POLICY', desc: '30-day seamless exchange window' },
              { icon: <Zap className="w-6 h-6" />, title: 'ARTISANAL QUALITY', desc: 'Rigorous 12-point quality inspection' },
            ].map((feature, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-brand-gold/80">{feature.icon}</div>
                <h4 className="font-semibold text-[10px] tracking-[0.2em]">{feature.title}</h4>
                <p className="text-white/40 text-[10px] leading-relaxed tracking-wide uppercase">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiries / Contact Section */}
      <section className="container mx-auto px-4 lg:px-12 py-40 border-t border-brand-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
           <div>
              <span className="text-brand-gold text-[10px] font-black uppercase tracking-[0.6em] mb-6 block">Concierge</span>
              <h2 className="text-6xl md:text-8xl font-display uppercase tracking-tight leading-none mb-12">Personal <br /> Archiving</h2>
              <p className="text-brand-black/40 font-serif italic text-xl max-w-sm leading-relaxed mb-12">
                Our specialists are available for tailored consultations regarding size, fit, and archival preservation.
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById('contact-reveal');
                  if (el) el.innerText = '+91 8076801908';
                }}
                className="luxury-button"
              >
                Reach Out
              </button>
           </div>
           <div className="bg-brand-beige p-16 lg:p-24 space-y-12">
              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Studio Line</span>
                 <p id="contact-reveal" className="text-3xl font-display tracking-tight text-brand-black/40 italic">Details encrypted for privacy</p>
              </div>
              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Headquarters</span>
                 <p className="text-sm font-black uppercase tracking-[0.2em] leading-loose">
                    Plot 12, Okhla Industrial Area <br />
                    New Delhi, India 110020
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Modern Newsletter Section */}
      <section className="container mx-auto px-4 lg:px-12 py-20 bg-brand-beige/20 border-y border-brand-black/5">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-display uppercase tracking-tight">Join The Collective</h2>
          <p className="font-serif italic text-xl text-brand-black/60">
            Be the first to experience our seasonal drops and exclusive artisanal collaborations.
          </p>
          <form className="flex border-b border-brand-black pb-2 pt-8" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="flex-grow bg-transparent px-2 py-4 outline-none text-xs font-semibold tracking-widest placeholder:text-brand-black/30"
            />
            <button className="uppercase text-[10px] tracking-widest font-black p-4 hover:translate-x-2 transition-transform">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function InitializeButton() {
  const [seeding, setSeeding] = useState(false);
  const { isAdmin } = useAuth();

  const seedData = async () => {
    setSeeding(true);
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const products = [
        {
          name: "Architectural Wool Overcoat",
          description: "A masterclass in minimalism. Structured silhouette crafted from 100% fine double-faced Merino wool. Designed for a razor-sharp yet relaxed archival fit.",
          price: 45000,
          salePrice: 45000,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1539109136881-3be0610931c3?q=80&w=2000&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Outerwear",
          sizes: ["XS", "S", "M", "L"],
          colors: ["Oatmeal", "Obsidian"],
          stock: 12,
          rating: 4.9,
          reviewCount: 24,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Fluid Silk Bias-Cut Slip",
          description: "Effortless identity. Cut on the bias to drape with liquid grace, crafted from 30 momme mulberry silk. The ultimate evening archive piece.",
          price: 18500,
          salePrice: 18500,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Dresses",
          sizes: ["S", "M", "L"],
          colors: ["Midnight", "Champagne"],
          stock: 25,
          rating: 4.8,
          reviewCount: 56,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Standard 2-Ply Cashmere Knit",
          description: "The foundation of the modern uniform. Exceptionally soft 2-ply cashmere, sourced from sustainable Mongolian herders. A permanent piece for the refined individual.",
          price: 12000,
          salePrice: 12000,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2000&auto=format&fit=crop"],
          category: "Men",
          subcategory: "Knitwear",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Grey Melange", "Navy"],
          stock: 40,
          rating: 4.7,
          reviewCount: 38,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Refined Linen Chore Jacket",
          description: "A rugged standard elevated. Heavyweight European flax linen that develops character with every wear. Features hand-polished Corozo nut buttons.",
          price: 9500,
          salePrice: 7600,
          discountPercentage: 20,
          images: ["https://images.unsplash.com/photo-1555069519-030805cc4638?q=80&w=2000&auto=format&fit=crop"],
          category: "Men",
          subcategory: "Outerwear",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Sand", "Olive"],
          stock: 15,
          rating: 4.9,
          reviewCount: 15,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Geometric Nappa Leather Tote",
          description: "Minimalist geometry in vegetable-tanned Italian Nappa leather. Seamless construction for a clean aesthetic. An object of pure utility.",
          price: 22000,
          salePrice: 22000,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1584917469274-96ce157ad5ef?q=80&w=2000&auto=format&fit=crop"],
          category: "Accessories",
          subcategory: "Bags",
          sizes: ["One Size"],
          colors: ["Tan", "Black"],
          stock: 8,
          rating: 5.0,
          reviewCount: 12,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Heavyweight Sculpted Midi Dress",
          description: "Architectural silhouette in heavyweight matte ponte knit. A study in modern geometry and restraint. Designed for presence.",
          price: 15980,
          salePrice: 7990,
          discountPercentage: 50,
          images: ["https://images.unsplash.com/photo-1539109132374-34fa4563a86b?q=80&w=1974&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Dresses",
          sizes: ["S", "M", "L"],
          stock: 25,
          rating: 4.9,
          reviewCount: 231,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Satin Asymmetrical Top",
          description: "High-shine satin with a unique architectural drape. Perfect for layering within the modern archive.",
          price: 8900,
          salePrice: 8900,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Tops",
          sizes: ["XS", "S", "M", "L"],
          colors: ["Ivory", "Midnight"],
          stock: 30,
          rating: 4.8,
          reviewCount: 42,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Fine Knit Mohair Cardigan",
          description: "Ethereal weight with exceptional warmth. A study in texture and transparency.",
          price: 14500,
          salePrice: 14500,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Knitwear",
          sizes: ["S", "M", "L"],
          colors: ["Cloud", "Soot"],
          stock: 18,
          rating: 4.9,
          reviewCount: 29,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      for (const p of products) {
        await addDoc(collection(db, 'products'), p);
      }
      toast.success('Archive initialized successfully!');
      window.location.reload();
    } catch (err) {
      toast.error('Seeding failed');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/20">System Administration</p>
      <button 
        onClick={seedData} 
        disabled={seeding}
        className="luxury-button !bg-brand-gold !text-brand-black hover:!bg-brand-black hover:!text-white"
      >
        {seeding ? 'Syncing Archive...' : 'Initialize Foundation Data'}
      </button>
    </div>
  );
}
