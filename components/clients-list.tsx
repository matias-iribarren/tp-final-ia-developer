"use client"

import { useState } from "react"
import { Trash2, Mail, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deleteClient } from "@/app/actions/clients"
import type { Client } from "@/lib/types"

interface ClientsListProps {
  clients: Client[]
}

export function ClientsList({ clients }: ClientsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (
      !confirm("Are you sure you want to delete this client? Projects associated with this client will not be deleted.")
    ) {
      return
    }

    setDeletingId(id)
    const result = await deleteClient(id)

    if (result.error) {
      alert(result.error)
    }

    setDeletingId(null)
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No clients yet</p>
          <p className="text-sm text-muted-foreground">Create your first client to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Card key={client.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{client.name}</h3>
                <div className="mt-2 space-y-1">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => handleDelete(client.id)}
                disabled={deletingId === client.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
