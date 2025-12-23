'use client'

import { useState, useMemo } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Github, HelpCircle, Puzzle } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 修复类型检查和搜索逻辑
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return []

    const results: Array<{
      category: NavigationItem
      items: (NavigationItem | NavigationSubItem)[]
      subCategories: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }>
    }> = []

    navigationData.navigationItems.forEach(category => {
      // 搜索主分类下的项目（只搜索启用的）
      const items = (category.items || []).filter(item => {
        if (item.enabled === false) return false
        const titleMatch = item.title.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        return titleMatch || descMatch
      })

      // 搜索子分类下的项目（只搜索启用的）
      const subResults: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }> = []

      if (category.subCategories) {
        category.subCategories.forEach(sub => {
          if (sub.enabled === false) return
          const subItems = (sub.items || []).filter(item => {
            if (item.enabled === false) return false
            const titleMatch = item.title.toLowerCase().includes(query)
            const descMatch = item.description?.toLowerCase().includes(query)
            return titleMatch || descMatch
          })

          if (subItems.length > 0) {
            subResults.push({
              title: sub.title,
              items: subItems
            })
          }
        })
      }

      // 只有当主分类或子分类有匹配结果时才添加到结果中
      if (items.length > 0 || subResults.length > 0) {
        results.push({
          category,
          items,
          subCategories: subResults
        })
      }
    })

    // 调试信息
    if (query && results.length > 0) {
      console.log('搜索结果:', {
        query,
        totalResults: results.length,
        results: results.map(r => ({
          category: r.category.title,
          mainItems: r.items.length,
          subCategories: r.subCategories.map(s => ({
            title: s.title,
            items: s.items.length
          }))
        }))
      })
    }

    return results
  }, [navigationData, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      <div className="hidden sm:block">
        <Sidebar
          navigationData={navigationData}
          siteInfo={siteData}
          className="sticky top-0 h-screen"
        />
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all sm:hidden",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 right-0 sm:left-0 w-3/4 max-w-xs bg-background shadow-lg transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full sm:-translate-x-full"
        )}>
          <Sidebar
            navigationData={navigationData}
            siteInfo={siteData}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <main className="flex-1">
        {/* 顶部导航栏 - 更现代化的设计 */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 px-4 sm:px-6 py-3 border-b border-border/50 shadow-sm">
          <div className="flex items-center gap-3 max-w-7xl mx-auto">
            <div className="flex-1">
              <SearchBar
                navigationData={navigationData}
                onSearch={handleSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
                siteConfig={siteData}
              />
            </div>
            <div className="flex items-center gap-1">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 主内容区 - 增加间距和容器宽度 */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          <div className="space-y-8">
            {navigationData.navigationItems.map((category) => (
              <section key={category.id} id={category.id} className="scroll-m-20">
                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                    {category.title}
                  </h2>

                  {category.subCategories && category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} id={subCategory.id} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {subCategory.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {(subCategory.items || []).map((item) => (
                            <NavigationCard key={item.id} item={item} siteConfig={siteData} />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {(category.items || []).map((item) => (
                        <NavigationCard key={item.id} item={item} siteConfig={siteData} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        {/* 页脚 */}
        <Footer siteInfo={siteData} />
      </main>
    </div>
  )
}
