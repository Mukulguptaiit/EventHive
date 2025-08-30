import Link from "next/link";
import { Separator } from "../ui/separator";
import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-2xl font-bold text-transparent">
              EventHive
            </div>
            <p className="text-gray-400">
              Your ultimate platform for discovering and managing events with
              seamless registration and ticketing.
            </p>
            <div className="flex space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-sm font-bold">in</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Find Events
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Event Categories
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                How it Works
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <div className="space-y-2">
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Help Center
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Contact Us
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="block text-gray-400 transition-colors hover:text-emerald-400"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <p>📧 hello@eventhive.com</p>
              <p>📞 +91 98765 43210</p>
              <p>📍 Ahmedabad, Gujarat</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-gray-400">
            © 2024 EventHive. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-gray-400">Secure & Trusted Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
