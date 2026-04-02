// import { Link } from 'react-router-dom';
 import { Wrench, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import React from 'react'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Hand Tools', href: '/products?category=hand-tools' },
    { label: 'Power Tools', href: '/products?category=power-tools' },
    { label: 'Safety Gear', href: '/products?category=safety-gear' },
  ],
  services: [
    { label: 'Equipment Rental', href: '/rent' },
    { label: 'Tool Repair', href: '/services' },
    { label: 'Consultation', href: '/services' },
    { label: 'Custom Fabrication', href: '/services' },
  ],
  company: [
    { label: 'About Us', href: '/' },
    { label: 'Contact', href: '/' },
    { label: 'Careers', href: '/' },
    { label: 'Blog', href: '/' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '/', label: 'Facebook' },
  { icon: Twitter, href: '/', label: 'Twitter' },
  { icon: Instagram, href: '/', label: 'Instagram' },
  { icon: Youtube, href: '/', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/30">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight">
                  Hardware<span className="text-blue-400">Hub</span>
                </span>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Industrial Supply
                </div>
              </div>
            </div>
            <p className="text-slate-400 max-w-sm">
              Your trusted partner for professional-grade hardware, equipment rentals, and expert services. Quality tools for quality work.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-100">
                Open 7 days
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-100">
                Pro contractors
              </span>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-100">Shop</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-100">Services</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-100">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
                  <MapPin className="h-4 w-4 text-blue-400" />
                </span>
                <span>Gapali,Bhaktapur,Nepal</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
                  <Phone className="h-4 w-4 text-blue-400" />
                </span>
                <span>9741807925</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
                  <Mail className="h-4 w-4 text-blue-400" />
                </span>
                <span>Hardware Hub@gmail.com</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 hover:bg-blue-500 hover:text-slate-950 transition-colors shadow-sm"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/70 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            © 2024 Harware Hub. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/" className="text-slate-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/" className="text-slate-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="/" className="text-slate-400 hover:text-blue-400 transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
    );
}


