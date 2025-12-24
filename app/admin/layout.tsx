import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'
import { Toaster } from "@/registry/new-york/ui/toaster"
import { Metadata } from 'next'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'NavSphere Admin',
  description: 'NavSphere Admin Dashboard',
  icons: {
    icon: '/assets/images/favicon.webp',
    shortcut: '/assets/images/favicon.webp',
    apple: '/assets/images/favicon.webp',
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session
  try {
    // 在 Edge Runtime 中使用 cookies() 来获取正确的请求上下文
    session = await auth()
  } catch (error) {
    console.error('Auth error in admin layout:', error)
    // 如果认证失败，重定向到登录页
    redirect('/auth/signin')
  }

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <AdminLayoutClient
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }}
      >
        {children}
      </AdminLayoutClient>
      <Toaster />
    </>
  )
} 