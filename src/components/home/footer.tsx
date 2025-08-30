"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">E</span>
              </div>
              <h3 className="text-xl font-bold">EventHive</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Where Events Come Alive. Discover amazing events, connect with like-minded people, 
              and create unforgettable memories.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/venues" className="text-gray-300 hover:text-white transition-colors">
                  Find Venues
                </Link>
              </li>
              <li>
                <Link href="/dashboard/create-event" className="text-gray-300 hover:text-white transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-300 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Stay Updated</h4>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for the latest events and updates.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <Badge variant="secondary" className="mt-3 bg-blue-100 text-blue-800">
              Join 10K+ subscribers
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">hello@eventhive.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-white">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-white">Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span>© 2024 EventHive. All rights reserved.</span>
              <span>•</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>in India</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
