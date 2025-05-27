"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdvertisingModal } from "@/components/advertising-modal"
import { AdvertisingDashboard } from "@/components/advertising-dashboard"
import { Megaphone, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdvertisingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#666666] hover:text-[#333333] mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Radio
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#333333] flex items-center gap-3">
                <Megaphone className="h-8 w-8 text-[#ff5722]" />
                Advertising Center
              </h1>
              <p className="text-[#666666] mt-2">
                Manage your advertising campaigns and reach thousands of listeners
              </p>
            </div>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#ff5722] hover:bg-[#f4511e] text-white"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Place New Ad
            </Button>
          </div>
        </div>

        {/* Dashboard */}
        <AdvertisingDashboard />

        {/* Advertising Modal */}
        <AdvertisingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </div>
  )
}
