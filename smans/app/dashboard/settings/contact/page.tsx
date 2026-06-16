// app/dashboard/settings/contact/page.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send, 
  Clock, 
  ChevronRight,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactSupportPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the form data to your backend
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll get back to you within 24 hours",
      details: "support@smans.co.ke",
      action: "mailto:support@smans.co.ke",
      actionText: "Send Email →",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      details: "Available 8 AM - 6 PM (EAT)",
      action: "#",
      actionText: "Start Chat →",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly during business hours",
      details: "+254 700 123 456",
      action: "tel:+254700123456",
      actionText: "Call Now →",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const faqs = [
    {
      question: "How quickly will I get a response?",
      answer: "We typically respond within 24 hours during business days. For urgent issues, please call our phone support."
    },
    {
      question: "What information should I include in my support request?",
      answer: "Please include your school name, user ID, and a detailed description of the issue you're experiencing."
    },
    {
      question: "Can I get help with setup and configuration?",
      answer: "Yes! Our support team can assist with setup, configuration, and best practices for using SMANS effectively."
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <Link href="/dashboard/settings" className="hover:text-primary">Settings</Link>
          <ChevronRight className="h-4 w-4" />
          <span>Contact Support</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mt-2">Contact Support</h1>
        <p className="text-base-content/60 mt-1">
          Get help with any questions or issues you're experiencing
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.title} className="hover:shadow-md transition-all border border-base-200 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${method.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-6 w-6 ${method.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{method.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{method.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-base-content">{method.details}</p>
                  <Link 
                    href={method.action} 
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {method.actionText}
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send us a message</CardTitle>
              <CardDescription>
                Fill in the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold">Message Sent!</h3>
                  <p className="text-base-content/60 mt-2">
                    Thank you for contacting us. We'll respond within 24 hours.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@school.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Please provide as much detail as possible..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Information */}
        <div className="space-y-5">
          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Monday - Friday</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Saturday</span>
                <span>9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Sunday</span>
                <span>Closed</span>
              </div>
              <div className="text-xs text-base-content/50 mt-2">All times are in East Africa Time (EAT)</div>
            </CardContent>
          </Card>

          {/* Quick FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Quick FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">
                    {faq.question}
                  </summary>
                  <p className="text-sm text-base-content/60 mt-1 pl-2 border-l-2 border-primary/30">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <Phone className="h-5 w-5" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700/80">
                For critical issues outside business hours, please call:
              </p>
              <p className="text-lg font-bold text-red-700 mt-2">
                +254 700 123 456
              </p>
              <p className="text-xs text-red-600/60 mt-1">
                Press 1 for emergency support
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-base-content/60 border-t border-base-200 pt-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Email:</span>
          <a href="mailto:support@smans.co.ke" className="text-primary hover:underline">
            support@smans.co.ke
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>Phone:</span>
          <a href="tel:+254700123456" className="text-primary hover:underline">
            +254 700 123 456
          </a>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>Location:</span>
          <span>Nairobi, Kenya</span>
        </div>
      </div>
    </div>
  );
}