"use client";

import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface CallToActionProps {
  onCreateEvent?: () => void;
}

export function CallToAction({ onCreateEvent }: CallToActionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto">
              <Star className="h-10 w-10 text-orange-600 fill-yellow-400" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your Event?
          </h2>

          {/* Description */}
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of organizers who trust EventHive to bring their events to life. 
            Start creating memorable experiences today.
          </p>

          {/* CTA Button */}
          <Button
            size="lg"
            className="bg-white text-orange-600 hover:bg-orange-50 font-semibold text-lg px-8 py-4 h-auto"
            onClick={onCreateEvent}
          >
            Start Creating
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {/* Additional Info */}
          <div className="mt-8 text-orange-100">
            <p className="text-sm">
              It's free to get started • No credit card required • Launch in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
