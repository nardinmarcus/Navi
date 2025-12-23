import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/registry/new-york/ui/card'
import { Icons } from '@/components/icons'
import type { NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavigationCardProps {
  item: NavigationSubItem
  siteConfig?: SiteConfig
}

export function NavigationCard({ item, siteConfig }: NavigationCardProps) {
  const isExternalIcon = item.icon?.startsWith('http')
  const isLocalIcon = item.icon && !isExternalIcon

  const iconPath = isLocalIcon && item.icon
    ? item.icon.startsWith('/') 
      ? item.icon 
      : `/${item.icon}`
    : item.icon || '/placeholder-icon.png'

  // 获取链接打开方式，默认为新窗口
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="group overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 border-border/50 hover:border-primary/50 bg-card/50 hover:bg-card backdrop-blur-sm">
            <Link
              href={item.href}
              target={linkTarget}
              rel="noopener noreferrer"
              className="block h-full"
            >
              <CardHeader className="relative">
                {/* 悬停时的背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                <div className="relative flex items-start gap-2 sm:gap-4">
                  {item.icon && (
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 p-2 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                      <img
                        src={item.icon}
                        alt={`${item.title} icon`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-semibold group-hover:text-primary transition-colors duration-200">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-xs sm:text-sm line-clamp-2 text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          sideOffset={8}
          className="max-w-[280px] text-xs sm:text-sm"
        >
          <p>{item.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
