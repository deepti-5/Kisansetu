import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
{
  id: 'test-001',
  name: 'Raju Shinde',
  role: 'Wheat Farmer, Nashik',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_127142f62-1763299279133.png",
  imageAlt: 'Indian male wheat farmer in his 50s wearing white kurta in green field',
  rating: 5,
  text: 'KisanSetu ne meri harvest ke liye Harvester book karna bahut aasan kar diya. Sirf 3 steps mein booking ho gayi aur deposit bhi wapas mila!',
  language: 'Hindi'
},
{
  id: 'test-002',
  name: 'Priya Kulkarni',
  role: 'Vegetable Farmer, Pune',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f4ab96d7-1772387562840.png",
  imageAlt: 'Indian female vegetable farmer in her 30s wearing colorful dupatta smiling outdoors',
  rating: 5,
  text: 'I found 3 excellent spraying workers within 2 km of my farm in just minutes. The rating system helped me choose the best one. Highly recommend!',
  language: 'English'
},
{
  id: 'test-003',
  name: 'Santosh Pawar',
  role: 'Sugarcane Farmer, Kolhapur',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f4ab96d7-1772387562840.png",
  imageAlt: 'Indian male sugarcane farmer in his 40s wearing checked shirt standing in farm field',
  rating: 4,
  text: 'DAP Fertilizer and Paddy Seeds delivered same day. Prices are much better than local market. App works in Marathi which is very helpful.',
  language: 'English'
}];


export default function TestimonialsSection() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-8">
          <h2 className="section-title text-2xl mb-2">Farmers Love KisanSetu</h2>
          <p className="text-muted-foreground">Real stories from real farmers across Maharashtra</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS?.map((t) =>
          <div key={t?.id} className="card-base p-6 relative">
              <Quote size={24} className="text-primary/20 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                  <AppImage
                  src={t?.image}
                  alt={t?.imageAlt}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full" />
                
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t?.name}</p>
                  <p className="text-xs text-muted-foreground">{t?.role}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 })?.map((_, i) =>
                  <Star
                    key={`star-${t?.id}-${i + 1}`}
                    size={11}
                    className={i < t?.rating ? 'text-accent fill-accent' : 'text-muted'} />

                  )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t?.text}&rdquo;</p>
              <div className="mt-3">
                <span className="badge-blue text-xs">{t?.language}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}