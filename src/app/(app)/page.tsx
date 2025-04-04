"use client";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { Mail } from "lucide-react";
export default function Home() {
  const messages = [
    {
      title: "Message from Alex",
      content: "Hey! Just checking in, hope you're doing great!",
      received: "5 minutes ago",
    },
    {
      title: "Message from BookLover99",
      content: "Do you have any thriller book recommendations?",
      received: "1 hour ago",
    },
    {
      title: "Review from TechGeek42",
      content: "Loved your recent post about AI! Really insightful.",
      received: "3 hours ago",
    },
    {
      title: "Feedback from FoodieGal",
      content: "I tried the pasta recipe you shared—absolutely delicious!",
      received: "1 day ago",
    },
    {
      title: "Review from MovieBuff77",
      content: "Your review of 'Interstellar' was spot on! Totally agree with you.",
      received: "2 days ago",
    },
    {
      title: "Message from SecretFan",
      content: "Your content always makes my day. Keep it up!",
      received: "3 days ago",
    },
  ];
  const autoplayPlugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));

  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
        <section className="text-center mb-8 md:mb-12">
          <div className="flex text-3xl md:text-5xl font-bold">
            <h1>Dive into the World of&nbsp; </h1>
            <h1 className="text-[#23374c]"> Re</h1>
            <h1 className="text-[#e69a3f]"> v</h1>
            <h1 className="text-[#23374c]"> iew</h1>
          </div>
          <p className="mt-3 md:mt-4 text-base md:text-lg">Review - Where your identity remains a secret.</p>
        </section>

        {/* Carousel for Messages */}

        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem
                key={index}
                className="p-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{message.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs text-muted-foreground">{message.received}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </main>
    </>
  );
}
