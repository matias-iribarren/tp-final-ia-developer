"use client"

import { useState } from "react"
import { Trash2, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteTag } from "@/app/actions/tags"
import type { Tag } from "@/lib/types"

interface TagsListProps {
  tags: Tag[]
}

export function TagsList({ tags }: TagsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tag?")) {
      return
    }

    setDeletingId(id)
    const result = await deleteTag(id)

    if (result.error) {
      alert(result.error)
    }

    setDeletingId(null)
  }

  if (tags.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TagIcon className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No tags yet</p>
          <p className="text-sm text-muted-foreground">Create your first tag to categorize time entries</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
          <TagIcon className="h-3 w-3" />
          {tag.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => handleDelete(tag.id)}
            disabled={deletingId === tag.id}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}
