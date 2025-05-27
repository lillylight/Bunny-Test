"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, Check, Upload, Clock, Badge, Radio, ArrowRight, ArrowLeft, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OnchainCheckout } from "@/components/onchain-checkout"
import { advertisingService, AdvertisingService, type AdSlot } from "@/lib/advertising-service"

interface AdvertisingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdvertisingModal({ isOpen, onClose }: AdvertisingModalProps) {
  const [companyName, setCompanyName] = useState("")
  const [adScript, setAdScript] = useState("")
  const [selectedShow, setSelectedShow] = useState("")
  const [adType, setAdType] = useState<"script" | "audio">("script")
  const [packageType, setPackageType] = useState<"standard" | "branded">("standard")
  const [duration, setDuration] = useState<10 | 20 | 30>(10)
  const [brandCategory, setBrandCategory] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form")
  const [formStep, setFormStep] = useState<1 | 2>(1)
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AdSlot[]>([])
  const { toast } = useToast()

  // Auto-select current show if user is on the main page
  useEffect(() => {
    if (isOpen && !selectedShow) {
      // Get current show based on time
      const now = new Date()
      const currentHour = now.getHours()
      
      // Determine current show based on schedule
      if (currentHour >= 6 && currentHour < 9) {
        setSelectedShow("Morning Vibes with AI Alex")
      } else if (currentHour >= 9 && currentHour < 11) {
        setSelectedShow("Tech Talk with Neural Nancy")
      } else if (currentHour >= 11 && currentHour < 14) {
        setSelectedShow("Midday Mix with Digital Dave")
      } else if (currentHour >= 14 && currentHour < 16) {
        setSelectedShow("Science Hour with Synthetic Sam")
      } else if (currentHour >= 16 && currentHour < 19) {
        setSelectedShow("Evening Groove with Virtual Vicky")
      } else if (currentHour >= 19 && currentHour < 22) {
        setSelectedShow("Night Owl with Algorithmic Andy")
      } else {
        setSelectedShow("Overnight Automation")
      }
    }
  }, [isOpen, selectedShow])

  // Load available slots when show is selected
  useEffect(() => {
    if (selectedShow && duration) {
      // Get show duration based on show name
      const showDurations: { [key: string]: number } = {
        "Morning Vibes with AI Alex": 180,
        "Tech Talk with Neural Nancy": 120,
        "Midday Mix with Digital Dave": 180,
        "Science Hour with Synthetic Sam": 120,
        "Evening Groove with Virtual Vicky": 180,
        "Night Owl with Algorithmic Andy": 180,
        "Overnight Automation": 480,
      }
      
      const showDuration = showDurations[selectedShow] || 60
      const slots = advertisingService.getAvailableSlots(selectedShow, showDuration)
      
      // Filter slots by selected duration
      const filteredSlots = slots.filter(slot => slot.duration === duration)
      setAvailableSlots(filteredSlots)
      
      // Auto-select first available slot
      if (filteredSlots.length > 0 && !selectedSlot) {
        setSelectedSlot(filteredSlots[0])
      }
    }
  }, [selectedShow, duration])

  const shows = [
    "Morning Vibes with AI Alex",
    "Tech Talk with Neural Nancy",
    "Midday Mix with Digital Dave",
    "Science Hour with Synthetic Sam",
    "Evening Groove with Virtual Vicky",
    "Night Owl with Algorithmic Andy",
    "Overnight Automation",
  ]

  const brandCategories = [
    { value: "technology", label: "Technology" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "entertainment", label: "Entertainment" },
    { value: "business", label: "Business" },
    { value: "health", label: "Health & Wellness" },
    { value: "food", label: "Food & Beverage" },
    { value: "automotive", label: "Automotive" },
    { value: "fashion", label: "Fashion & Beauty" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // This is now handled in the payment button
  }

  const resetForm = () => {
    setCompanyName("")
    setAdScript("")
    setSelectedShow("")
    setAdType("script")
    setDuration(10)
    setBrandCategory("")
    setAudioFile(null)
    setPaymentStep("form")
    setFormStep(1)
    setSelectedSlot(null)
    setAvailableSlots([])
  }

  const validateStep1 = () => {
    if (!companyName.trim()) {
      toast({
        title: "Missing Company Name",
        description: "Please enter your company name",
        variant: "destructive",
      })
      return false
    }
    if (!selectedShow) {
      toast({
        title: "Missing Show Selection",
        description: "Please select a show for your advertisement",
        variant: "destructive",
      })
      return false
    }
    if (!brandCategory) {
      toast({
        title: "Missing Brand Category",
        description: "Please select your brand category",
        variant: "destructive",
      })
      return false
    }
    if (adType === "script" && !adScript.trim()) {
      toast({
        title: "Missing Advertisement Script",
        description: "Please enter your advertisement script",
        variant: "destructive",
      })
      return false
    }
    if (adType === "audio" && !audioFile) {
      toast({
        title: "Missing Audio File",
        description: "Please upload your audio advertisement",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && paymentStep !== "processing") {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-[#f5f5f5] border-[#e0e0e0] text-[#333333]">
        <DialogHeader>
          <DialogTitle className="text-xl">Place an Advertisement</DialogTitle>
          <DialogDescription className="text-[#666666]">
            {formStep === 1 ? "Tell us about your advertisement" : "Choose your package"}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === "form" && (
          <form onSubmit={handleSubmit}>
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  formStep >= 1 ? 'bg-[#ff5722] text-white' : 'bg-[#e0e0e0] text-[#666666]'
                }`}>
                  1
                </div>
                <div className={`w-20 h-1 transition-colors ${formStep >= 2 ? 'bg-[#ff5722]' : 'bg-[#e0e0e0]'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  formStep >= 2 ? 'bg-[#ff5722] text-white' : 'bg-[#e0e0e0] text-[#666666]'
                }`}>
                  2
                </div>
              </div>
            </div>

            <div className="relative min-h-[400px]">
              {/* Step 1: Ad Details */}
              {formStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="companyName" className="text-[#333333]">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-white border-[#e0e0e0] text-[#333333]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="show" className="text-[#333333]">
                      Select Show
                    </Label>
                    <Select value={selectedShow} onValueChange={setSelectedShow}>
                      <SelectTrigger className="bg-white border-[#e0e0e0] text-[#333333]">
                        <SelectValue placeholder="Select a show" />
                      </SelectTrigger>
                      <SelectContent>
                        {shows.map((show) => (
                          <SelectItem key={show} value={show}>
                            {show}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category" className="text-[#333333]">
                      Brand Category
                    </Label>
                    <Select value={brandCategory} onValueChange={setBrandCategory}>
                      <SelectTrigger className="bg-white border-[#e0e0e0] text-[#333333]">
                        <SelectValue placeholder="Select your brand category" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#666666]">
                      We'll match your ad to shows that align with your brand
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#333333]">Advertisement Type</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="script"
                          name="adType"
                          value="script"
                          checked={adType === "script"}
                          onChange={() => setAdType("script")}
                          className="mr-2"
                        />
                        <Label htmlFor="script" className="text-[#333333] cursor-pointer">
                          Text Script
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="audio"
                          name="adType"
                          value="audio"
                          checked={adType === "audio"}
                          onChange={() => setAdType("audio")}
                          className="mr-2"
                        />
                        <Label htmlFor="audio" className="text-[#333333] cursor-pointer">
                          Audio File
                        </Label>
                      </div>
                    </div>
                  </div>

                  {adType === "script" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="adScript" className="text-[#333333]">
                        Advertisement Script
                      </Label>
                      <Textarea
                        id="adScript"
                        value={adScript}
                        onChange={(e) => setAdScript(e.target.value)}
                        placeholder="Enter your advertisement script (max 100 words). Our AI host will read this during the show."
                        className="bg-white border-[#e0e0e0] text-[#333333] min-h-[100px]"
                      />
                      <p className="text-xs text-[#666666]">
                        Note: If your script is too long, our AI will automatically shorten it while preserving your message.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="audioFile" className="text-[#333333]">
                        Upload Audio File
                      </Label>
                      <div className="relative border-2 border-dashed border-[#e0e0e0] rounded-md p-6 flex flex-col items-center justify-center bg-white">
                        <Upload className="h-8 w-8 text-[#999999] mb-2" />
                        <p className="text-sm text-[#666666] text-center">
                          Click to upload or drag and drop your audio file (MP3)
                        </p>
                        {audioFile && (
                          <p className="text-xs text-[#4caf50] mt-2">
                            Selected: {audioFile.name}
                          </p>
                        )}
                        <input
                          type="file"
                          id="audioFile"
                          accept="audio/mp3,audio/mpeg"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) {
                          setFormStep(2)
                        }
                      }}
                      className="flex-1 bg-[#ff5722] hover:bg-[#f4511e] text-white"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Package Selection */}
              {formStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label className="text-[#333333]">Advertisement Duration</Label>
                    <div className="flex gap-3">
                      {[10, 20, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDuration(d as 10 | 20 | 30)
                            setSelectedSlot(null) // Reset slot selection when duration changes
                          }}
                          className={`flex-1 py-3 px-4 rounded-md border-2 transition-all ${
                            duration === d
                              ? "border-[#ff5722] bg-[#ff5722]/10 text-[#ff5722]"
                              : "border-[#e0e0e0] text-[#666666] hover:border-[#999999]"
                          }`}
                        >
                          <Clock className="h-5 w-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">{d}s</span>
                          <div className="text-xs mt-1">
                            ${AdvertisingService.getPricing(d as 10 | 20 | 30, 'standard')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#333333]">Select Time Slot</Label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-md border-2 transition-all text-left ${
                              selectedSlot?.position === slot.position
                                ? "border-[#ff5722] bg-[#ff5722]/10"
                                : "border-[#e0e0e0] hover:border-[#999999]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#666666]" />
                                <span className="text-sm font-medium">{slot.label}</span>
                              </div>
                              <span className="text-xs text-[#666666]">
                                {slot.position < 60 ? `${slot.position} min` : `${Math.floor(slot.position / 60)}h ${slot.position % 60}m`} into show
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[#666666] text-sm">
                        No available slots for {duration}s ads in this show
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-[#333333]">Select Package</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div 
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          packageType === "standard" 
                            ? "border-[#ff5722] bg-[#ff5722]/5" 
                            : "border-[#e0e0e0] hover:border-[#999999]"
                        }`}
                        onClick={() => setPackageType("standard")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#333333]">Standard Advertisement</h4>
                            <p className="text-sm text-[#666666] mt-1">
                              Your ad will be read during the selected show
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#ff5722]">
                              ${AdvertisingService.getPricing(duration, 'standard')}
                            </p>
                            <p className="text-xs text-[#666666]">per ad</p>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          packageType === "branded" 
                            ? "border-[#ff5722] bg-[#ff5722]/5" 
                            : "border-[#e0e0e0] hover:border-[#999999]"
                        }`}
                        onClick={() => setPackageType("branded")}
                      >
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-[#ff5722] to-[#f4511e] text-white">
                          PREMIUM
                        </Badge>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#333333]">Branded Time Slot</h4>
                            <p className="text-sm text-[#666666] mt-1">
                              "This hour brought to you by {companyName || '[Your Company]'}"
                            </p>
                            <ul className="text-xs text-[#666666] mt-2 space-y-1">
                              <li className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-[#4caf50]" />
                                Full hour sponsorship
                              </li>
                              <li className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-[#4caf50]" />
                                Mentioned every 15 minutes
                              </li>
                              <li className="flex items-center gap-1">
                                <Check className="h-3 w-3 text-[#4caf50]" />
                                1 week duration
                              </li>
                            </ul>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#ff5722]">
                              ${AdvertisingService.getPricing(duration, 'branded')}
                            </p>
                            <p className="text-xs text-[#666666]">per week</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <OnchainCheckout
                      amount={AdvertisingService.getPricing(duration, packageType)}
                      description={`${packageType === "branded" ? "Branded Time Slot" : "Standard Advertisement"} - ${selectedShow}`}
                      buttonText={`Pay $${AdvertisingService.getPricing(duration, packageType)}`}
                      onSuccess={async () => {
                        setPaymentStep("processing")
                        
                        try {
                          let audioUrl = undefined
                          if (adType === "audio" && audioFile) {
                            audioUrl = URL.createObjectURL(audioFile)
                          }

                          const response = await fetch("/api/advertising", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              companyName,
                              adScript: adType === "script" ? adScript : undefined,
                              audioUrl,
                              selectedShow,
                              adType,
                              packageType,
                              duration,
                              brandCategory,
                              amount: AdvertisingService.getPricing(duration, packageType),
                              selectedSlot,
                            }),
                          })

                          if (!response.ok) {
                            throw new Error("Failed to save advertisement")
                          }

                          setPaymentStep("success")
                          
                          setTimeout(() => {
                            onClose()
                            resetForm()
                            toast({
                              title: "Advertisement Placed",
                              description: "Your advertisement has been scheduled successfully!",
                              duration: 5000,
                            })
                          }, 1500)
                        } catch (error) {
                          console.error("Error saving advertisement:", error)
                          toast({
                            title: "Error",
                            description: "Payment successful but failed to save advertisement. Please contact support.",
                            variant: "destructive",
                          })
                          setPaymentStep("form")
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </form>
        )}

        {paymentStep === "processing" && (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-t-transparent border-[#ff5722]"
              />
              <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-[#ff5722]" />
            </div>
            <p className="text-lg font-medium text-[#333333]">Processing Payment</p>
            <p className="text-sm text-[#666666] mt-2">Please wait while we process your payment...</p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#4caf50]/20 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-[#4caf50]" />
            </div>
            <p className="text-lg font-medium text-[#333333]">Payment Successful!</p>
            <p className="text-sm text-[#666666] mt-2">Your advertisement has been scheduled successfully.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
