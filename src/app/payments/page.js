"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get("plan") || "basic"

  const plans = [
    { id: "basic", name: "Basic Plan", price: "$29/month" },
    { id: "pro", name: "Pro Plan", price: "$99/month" },
    { id: "enterprise", name: "Enterprise Plan", price: "$299/month" },
  ]

  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardName: "",
    address: "",
    city: "",
    zip: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    // Update selected plan if URL param changes
    if (searchParams.get("plan") && searchParams.get("plan") !== selectedPlan) {
      setSelectedPlan(searchParams.get("plan"))
    }
  }, [searchParams, selectedPlan])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setPaymentDetails((prev) => ({ ...prev, [id]: value }))
  }

  const handlePlanChange = (value) => {
    setSelectedPlan(value)
    // Optionally update URL to reflect selected plan
    router.push(`/payments?plan=${value}`, undefined, { shallow: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setPaymentError(null)
    setPaymentSuccess(false)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock success/failure
    if (Math.random() > 0.1) {
      // 90% success rate
      setPaymentSuccess(true)
      // In a real app, you'd redirect or update user's subscription status
      console.log(`Successfully subscribed to ${selectedPlan} plan!`)
    } else {
      setPaymentError("Payment failed. Please check your details or try again.")
    }
    setIsLoading(false)
  }

  const currentPlanDetails = plans.find((p) => p.id === selectedPlan) || plans[0]

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Subscription</CardTitle>
          <CardDescription>
            You are subscribing to the <span className="font-semibold text-blue-600">{currentPlanDetails.name}</span>{" "}
            for <span className="font-semibold text-blue-600">{currentPlanDetails.price}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="plan-select">Choose your plan</Label>
            <Select value={selectedPlan} onValueChange={handlePlanChange}>
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} ({plan.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold">Payment Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input id="cardName" value={paymentDetails.cardName} onChange={handleInputChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9\s]{13,19}"
                autoComplete="cc-number"
                maxLength="19"
                placeholder="XXXX XXXX XXXX XXXX"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  pattern="(0[1-9]|1[0-2])\/?([0-9]{2})"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  type="text"
                  pattern="[0-9]{3,4}"
                  maxLength="4"
                  placeholder="XXX"
                  value={paymentDetails.cvc}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold mt-8">Billing Address</h3>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={paymentDetails.address} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={paymentDetails.city} onChange={handleInputChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input id="zip" value={paymentDetails.zip} onChange={handleInputChange} required />
              </div>
            </div>

            {paymentError && <p className="text-red-500 text-sm text-center">{paymentError}</p>}
            {paymentSuccess && (
              <p className="text-green-500 text-sm text-center">Payment successful! Redirecting to dashboard...</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing Payment..." : `Pay ${currentPlanDetails.price}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
