import { type NextRequest, NextResponse } from "next/server"
import { advertisingService } from "@/lib/advertising-service"

export async function POST(request: NextRequest) {
  try {
    const { 
      companyName, 
      adScript, 
      audioUrl,
      selectedShow, 
      adType, 
      packageType,
      duration,
      brandCategory,
      amount 
    } = await request.json()

    if (!companyName || !selectedShow || !adType || !amount || !duration || !brandCategory) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create the advertisement using the advertising service
    const advertisement = advertisingService.addAdvertisement({
      companyName,
      adScript: adScript || undefined,
      audioUrl: audioUrl || undefined,
      selectedShow,
      adType,
      duration,
      packageType: packageType || 'standard',
      amount,
      brandCategory,
    })

    return NextResponse.json({
      success: true,
      advertisement,
    })
  } catch (error) {
    console.error("Error in advertising API:", error)
    return NextResponse.json({ error: "Failed to process advertisement" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showName = searchParams.get('show')
    
    if (showName) {
      // Get advertisements for a specific show
      const advertisements = advertisingService.getAdvertisementsForShow(showName)
      return NextResponse.json({ advertisements })
    } else {
      // Get all advertisements
      const advertisements = advertisingService.getAllAdvertisements()
      const stats = advertisingService.getAdvertisingStats()
      return NextResponse.json({ advertisements, stats })
    }
  } catch (error) {
    console.error("Error fetching advertisements:", error)
    return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 })
  }
}
