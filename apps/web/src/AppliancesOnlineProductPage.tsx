import React from 'react';
import {
  Menu,
  Search,
  Phone,
  ShoppingCart,
  Info,
  Truck,
  MessageCircle,
} from 'lucide-react';

export const AppliancesOnlineProductPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center">
      <div className="w-full max-w-[768px] bg-[#f3f4f6] text-slate-900">
        {/* Top promo banner */}
        <div className="bg-[#00a9ce] text-white px-3 py-2 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold tracking-wide uppercase">
              Westinghouse Legendary BUYS
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              UNMISSABLE OFFERS
            </span>
          </div>
          <button className="ml-2 bg-[#004b9a] text-white text-[11px] font-semibold px-3 py-1 rounded">
            Shop Now
          </button>
        </div>

        {/* Header */}
        <header className="bg-white px-3 py-2 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button className="p-1 text-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <button className="p-1 text-slate-700">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center leading-tight">
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-semibold text-[#003057]">
                appliances
              </span>
              <span className="text-[18px] font-semibold text-[#00a9ce]">
                online
              </span>
            </div>
            <span className="text-[10px] text-slate-500 tracking-wide">
              legendary service
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-[#f7f7f8] text-[11px] text-slate-500 px-4 py-2 border-b border-slate-200">
          Washers and Dryers / Washer Dryer Combo
        </div>

        {/* Product hero */}
        <section className="bg-white px-4 pt-4 pb-3 border-b border-slate-200">
          {/* Bosch + product image row */}
          <div className="flex flex-col items-center">
            {/* Bosch logo row */}
            <div className="w-full flex items-center justify-start mb-1">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border border-slate-400" />
                </div>
                <span className="text-[#e30613] font-bold text-[15px] tracking-wide">
                  BOSCH
                </span>
              </div>
            </div>

            {/* Appliance hero image */}
            <div className="relative w-full flex justify-center mt-1 mb-3">
              <div className="w-[72%] max-w-[260px] aspect-[3/4] bg-gradient-to-b from-[#f7f8fa] to-[#e5e7eb] rounded-lg border border-slate-200 flex items-center justify-center">
                {/* Stylized washer / dryer */}
                <div className="w-[80%] h-[82%] bg-white rounded-md shadow-sm border border-slate-200 flex flex-col items-center pt-2">
                  {/* Top control panel */}
                  <div className="w-[88%] h-[18%] bg-[#f5f5f5] rounded-md border border-slate-200 flex items-center justify-between px-2">
                    <div className="w-10 h-3 bg-slate-200 rounded-sm" />
                    <div className="w-7 h-7 rounded-full border-2 border-slate-400" />
                  </div>
                  {/* Drum */}
                  <div className="mt-3 w-[72%] aspect-square rounded-full border-[6px] border-slate-300 flex items-center justify-center bg-slate-800">
                    <div className="w-[72%] h-[72%] rounded-full bg-gradient-to-br from-slate-200 to-slate-500 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Left gold badge */}
              <div className="absolute left-[10%] bottom-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-md flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full border border-white/60 flex items-center justify-center text-[7px] text-white text-center leading-tight font-semibold px-1">
                    MOST RELIABLE
                    <br />
                    CHOICE
                    <br />
                    2023
                  </div>
                </div>
              </div>

              {/* Right cyan badge */}
              <div className="absolute right-[8%] bottom-3">
                <div className="w-16 h-16 rounded-full bg-[#00b7e6] shadow-md flex items-center justify-center px-1">
                  <span className="text-[8px] font-semibold text-white text-center leading-tight">
                    FREE SAME DAY DELIVERY*
                  </span>
                </div>
              </div>

              {/* 360 button */}
              <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded border border-slate-300 bg-white text-[11px] text-slate-600 flex items-center justify-center">
                360°
              </button>
            </div>
          </div>

          {/* Product title */}
          <h1 className="text-center text-[15px] font-semibold text-slate-900 leading-snug px-2">
            Bosch Series 6 10kg/5kg Washer Dryer Combo WNA254U1AU
          </h1>

          {/* Reviews row */}
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="text-[13px] text-[#f97316]">
                  ★
                </span>
              ))}
              <span className="text-[13px] text-[#f97316]">★</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="font-semibold text-slate-800">4.6</span>
              <span className="text-slate-500">From 340 reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-3 flex flex-col items-center gap-1">
            <div className="text-[22px] font-bold text-[#16a34a]">
              $1,653
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px]">
              <span className="text-[#b91c1c] font-semibold">
                $546 (25%) off RRP of $2,199
              </span>
              <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                <Info className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* Benefit pills */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-full bg-[#16a34a] text-white text-[10px] font-semibold px-2.5 py-1">
              <Truck className="w-3 h-3" />
              <span>FREE DELIVERY</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#e0f7ff] text-[#0284c7] text-[10px] font-semibold px-2.5 py-1 border border-[#bae6fd]">
              <span>PRICE MATCH GUARANTEE</span>
            </div>
          </div>
        </section>

        {/* Add to cart area */}
        <section className="bg-[#f3f4f6] px-4 pt-4 pb-6 relative">
          <div className="bg-[#e5e7eb] rounded-t-lg px-3 pt-3 pb-4 border-t border-slate-300">
            <button className="relative w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-[15px] rounded-full py-3 flex items-center justify-center gap-2 shadow-md">
              <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </span>
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Chat bubble */}
          <button className="absolute right-6 bottom-5 w-11 h-11 rounded-full bg-[#00b7e6] shadow-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
        </section>
      </div>
    </div>
  );
};

