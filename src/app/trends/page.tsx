'use client';

import { useEffect, useState } from 'react';
import { TrendReport } from '@/types/trends';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { Loader2, TrendingUp, Zap, Tag, PieChart as PieIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GravityTags } from '@/components/ui/gravity-tags';
import { FluidBackground } from '@/components/ui/fluid-background';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export default function TrendPage() {
    const [report, setReport] = useState<TrendReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/trends')
            .then(res => res.json())
            .then(data => {
                setReport(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <TrendSkeleton />;
    if (!report) return <div>No data available</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        주간 기술 트렌드
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2">
                        AI가 분석한 최신 {report.totalArticles}개 기사 트렌드
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-full">
                    <span>📅 {new Date(report.startDate).toLocaleDateString()} ~ {new Date(report.endDate).toLocaleDateString()}</span>
                </div>
            </div>

            {/* AI Summary Card (Glassmorphism) */}
            <div className="relative overflow-hidden rounded-3xl p-8 border border-white/20">
                <FluidBackground className="-z-10 bg-white/40 dark:bg-black/20" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-800 dark:text-white">AI 트렌드 브리핑</h2>
                    </div>
                    <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-200 whitespace-pre-line">
                        {report.summary}
                    </p>

                    {/* Emerging Topics */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {report.emergingTopics.map((topic, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/30">
                                🚀 {topic}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Top Tags - Zero Gravity Zone */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 col-span-1 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-neutral-500" />
                            <h3 className="text-lg font-bold">인기 키워드 (무중력 존)</h3>
                        </div>
                        <span className="text-xs text-neutral-400">태그를 드래그해서 던져보세요! 🎈</span>
                    </div>
                    <GravityTags tags={report.topTags} className="h-[400px]" />
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-6">
                        <PieIcon className="w-5 h-5 text-neutral-500" />
                        <h3 className="text-lg font-bold">카테고리 분포</h3>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={report.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {report.categoryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

function TrendSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-64 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Skeleton className="h-80 w-full rounded-2xl" />
                <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
        </div>
    )
}
