import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Hero Skeleton */}
      <Card className="border-0 shadow-lg bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex flex-col items-center space-y-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Habits Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function HabitsListSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="py-4 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>

      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 4, 5].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function BadHabitsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="py-4 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>
      
      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function MissionsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="py-4 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function RewardsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="py-4 flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-md mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
