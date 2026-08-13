import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Phone, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 p-0.5 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-100 text-base tracking-tight">
                বাংলাদেশ নাগরিক সুরক্ষা
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              বাংলাদেশ জাতীয় জরুরি সেবা, ফায়ার সার্ভিস, পুলিশ, অ্যাম্বুলেন্স ও দুর্যোগ ব্যবস্থাপনা পোর্টালে স্বাগতম। দ্রুততম জরুরি তথ্য আদান-প্রদান ও সুরক্ষা নিশ্চিতকরণ প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">
                  হোম পোর্টাল (Home)
                </Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-cyan-400 transition-colors">
                  লাইভ ঘটনা ও ম্যাপ (Incident Map)
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-cyan-400 transition-colors">
                  জরুরি রিপোর্ট দিন (Report)
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-cyan-400 transition-colors">
                  জরুরি হটলাইন নম্বরসমূহ (BD Hotlines)
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts - Bangladesh Real Hotlines */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              বাংলাদেশ জরুরি হটলাইন (Valid BD Hotlines)
            </h4>
            <ul className="space-y-1.5 text-slate-400 font-mono">
              <li className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Phone className="w-3.5 h-3.5" /> জাতীয় জরুরি সেবা: ৯৯৯ (999)
              </li>
              <li className="text-amber-400 font-medium">নারী ও শিশু হেল্পলাইন: ১০৯ (109)</li>
              <li className="text-cyan-400">ফায়ার সার্ভিস কন্ট্রোল: ১৬১৬৩</li>
              <li className="text-emerald-400">সাইবার ক্রাইম হেল্পলাইন: ০১৭৬৯৬৯১৫২২</li>
              <li className="text-blue-400">ডিএমপি কন্ট্রোল রুম: ০২-২২৩ ৩৮১১৮৮</li>
            </ul>
          </div>

          {/* Citizen Security Assurance */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider font-mono">
              নাগরিক নিরাপত্তা নিশ্চয়তা
            </h4>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px] text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> সুরক্ষিত ও গোপনীয় তথ্য
              </div>
              <p className="text-slate-400 leading-relaxed">
                সকল নাগরিক রিপোর্ট শতভাগ সুরক্ষিত এবং ইমারজেন্সি রেসপন্স টিম দ্বারা ২৪/৭ মনিটর করা হয়।
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} Bangladesh Citizen Safety & Emergency Service Portal.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <HeartHandshake className="w-3.5 h-3.5" /> ২৪/৭ সক্রিয় নাগরিক ইমারজেন্সি সেবা
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
