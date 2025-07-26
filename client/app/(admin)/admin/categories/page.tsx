"use client"
import { CategoryAdminConfig } from '@/features/category/category.admin-config'
import { CategorySchema } from '@/features/category/category.schema'
import { SimpleAdminPage } from '@/shared/components/atoms/ui/simple-admin-page'

export default function CategoryAdminPage() {

  return (
    <SimpleAdminPage
      config={CategoryAdminConfig}
      schema={CategorySchema}
      filters={{}}
      className=""
    />
  )
}
