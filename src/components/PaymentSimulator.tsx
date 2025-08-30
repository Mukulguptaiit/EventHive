"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, CheckCircle } from "lucide-react";

interface PaymentSimulatorProps {
  amount: number;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentSimulator({
  amount,
  eventTitle,
  ticketType,
  quantity,
  onSuccess,
  onCancel
}: PaymentSimulatorProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    
    // Simulate payment processing
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  if (step === "processing") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "success") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your tickets have been booked successfully.</p>
          <p className="text-sm text-gray-500">You will receive a confirmation email shortly.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl font-semibold">Complete Payment</CardTitle>
  <p className="text-sm text-gray-600 mt-2">Secure test payment</p>
      </CardHeader>
      
      <CardContent>
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{eventTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket:</span>
              <span className="font-medium">{ticketType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-orange-600">₹{amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
              maxLength={19}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="text"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) => handleInputChange("expiry", formatExpiry(e.target.value))}
                maxLength={5}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                maxLength={4}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardHolder">Card Holder Name</Label>
            <Input
              id="cardHolder"
              type="text"
              placeholder="Cardholder Name"
              value={formData.cardHolder}
              onChange={(e) => handleInputChange("cardHolder", e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <Lock className="h-4 w-4 text-blue-600" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Pay ₹{amount.toLocaleString()}
            </Button>
          </div>
        </form>

        {/* Test Card Info */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">💡 Test Payment</h5>
          <p className="text-xs text-yellow-700">
            Use any valid card details for testing. This is a simulation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
