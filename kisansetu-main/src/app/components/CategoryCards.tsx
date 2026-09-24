import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const CATEGORIES = [
{
  id: 'equipment',
  title: 'Equipment',
  subtitle: 'Buy or Rent tractors, harvesters, tools & more with best deals',
  href: '/equipment-listing-page',
  color: 'from-green-600 to-green-800',
  badge: '2,345+ Listed',
  image: "https://images.unsplash.com/photo-1462811404017-1bb91081d006",
  imageAlt: 'Red Mahindra tractor in green agricultural field ready for farming',
  emoji: '🚜'
},
{
  id: 'labour',
  title: 'Labour',
  subtitle: 'Hire skilled labour for farming activities near you',
  href: '/labour',
  color: 'from-blue-600 to-blue-800',
  badge: '3,210+ Workers',
  image: "https://images.unsplash.com/photo-1708592956202-0d85c84969cb",
  imageAlt: 'Indian farm workers harvesting crops in a green field wearing traditional attire',
  emoji: '👨‍🌾'
},
{
  id: 'agri',
  title: 'Agri Supplies',
  subtitle: 'Seeds, Pesticides, Fertilizers & all farming essentials',
  href: '/agri',
  color: 'from-amber-500 to-amber-700',
  badge: '1,845+ Products',
  image: "https://images.unsplash.com/photo-1542567604-6ab95cbe4e82",
  imageAlt: 'Colorful agricultural seeds and fertilizer bags arranged on market display shelf',
  emoji: '🌱'
}];


export default function CategoryCards() {
  return (
    <section className="py-10 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIES?.map((cat) =>
          <Link
            key={`cat-${cat?.id}`}
            href={cat?.href}
            className="group relative overflow-hidden rounded-2xl shadow-card card-hover border border-border">
            
              <div className="relative h-40 overflow-hidden">
                <AppImage
                src={cat?.image}
                alt={cat?.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" />
              
                <div className={`absolute inset-0 bg-gradient-to-t ${cat?.color} opacity-70`} />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                    {cat?.badge}
                  </span>
                </div>
              </div>
              <div className="bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cat?.emoji}</span>
                  <h3 className="font-bold text-lg text-foreground">{cat?.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{cat?.subtitle}</p>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-green text-white text-sm font-semibold group-hover:opacity-90 transition-opacity">
                  Explore {cat?.title}
                  <span className="group-hover:translate-x-1 transition-transform duration-150">→</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </section>);

}