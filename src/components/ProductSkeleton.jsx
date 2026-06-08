import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[0.92] bg-slate-200 w-full" />
      
      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow justify-between gap-4">
        <div className="space-y-2">
          {/* Category Badge Skeleton */}
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          {/* Title Skeleton */}
          <div className="h-5 bg-slate-200 rounded w-3/4" />
        </div>
        
        {/* Price Skeleton */}
        <div className="h-6 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  );
}
