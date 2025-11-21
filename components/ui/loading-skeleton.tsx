import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AboutSkeleton() {
  return (
    <div className="w-full max-w-[1140px] space-y-4 md:space-y-5">
      {/* Compact Header Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-32 mx-auto md:h-10 md:w-40" />
        <Skeleton className="h-5 w-64 mx-auto md:h-6 md:w-80" />
      </div>

      {/* Compact Hero Card Skeleton */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32 md:h-6 md:w-40" />
        </CardHeader>
        <CardContent className="pt-0 p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:gap-5">
            {/* Compact Avatar Skeleton */}
            <div className="flex shrink-0 items-center justify-center md:items-start">
              <Skeleton className="h-28 w-28 rounded-xl md:h-32 md:w-32" />
            </div>
            {/* Compact Bio Content Skeleton */}
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-40 md:h-8 md:w-48" />
              <Skeleton className="h-5 w-32 md:h-6 md:w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats Grid Skeleton */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-gray-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-7 w-16 mb-1 md:h-8 md:w-20" />
                      <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Beyond Code Section Skeleton - Compact */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-gray-200 bg-white">
                <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                  <Skeleton className="h-10 w-10 rounded-lg mb-1.5" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Values Section Skeleton - Compact */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-5 w-40 md:h-6 md:w-48" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="border border-gray-200 bg-white">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-32 md:h-5 md:w-40" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* My Journey Section Skeleton - Compact */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative flex items-start gap-3 md:items-center">
                <div className="flex shrink-0 justify-end md:w-1/2 md:pr-6">
                  <Skeleton className="h-14 min-w-[80px] rounded-lg px-3" />
                </div>
                <div className="flex-1 md:w-1/2">
                  <Card className="border border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24 mb-1" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5 mt-1" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section Skeleton */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ExperienceSkeleton() {
  return (
    <div className="w-full max-w-[1140px] space-y-3 md:space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border border-gray-200/80 bg-white/98 shadow-sm">
          <CardHeader className="pb-2.5 md:pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5 md:gap-3">
                <Skeleton className="h-9 w-9 rounded-lg md:h-10 md:w-10" />
                <div>
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="space-y-1 mt-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkillsSkeleton() {
  return (
    <div className="w-full max-w-[1140px]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border border-gray-200/80 bg-white/98 shadow-sm">
            <CardHeader className="pb-2.5 md:pb-3">
              <div className="flex items-center gap-2.5 md:gap-3">
                <Skeleton className="h-9 w-9 rounded-lg md:h-10 md:w-10" />
                <Skeleton className="h-5 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProjectsSkeleton() {
  return (
    <div className="w-full max-w-[1140px]">
      <Card className="relative overflow-hidden border border-gray-200/80 bg-transparent p-0 shadow-xl">
        <Skeleton className="h-96 w-full" />
        <CardContent className="relative z-10 p-4 md:p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
