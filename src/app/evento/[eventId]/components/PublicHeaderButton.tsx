"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { RegistrationModal } from "./RegistrationModal"

export function PublicHeaderButton({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="font-bold text-xs rounded-xl shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Sparkles className="h-4 w-4 mr-1.5" />
        Inscrever-se Gratuitamente
      </Button>

      {isOpen && (
        <RegistrationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          eventId={eventId}
          eventName={eventName}
        />
      )}
    </>
  )
}
