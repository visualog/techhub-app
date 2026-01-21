"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Article } from "@/data/mock-articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
// import { ArticleDetailModal } from "@/components/ui/ArticleDetailModal";
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleListSkeleton } from "@/components/ui/ArticleListSkeleton";
import dynamic from "next/dynamic";
import useSWR from 'swr';

const ArticleDetailModal = dynamic(() => import("@/components/ui/ArticleDetailModal").then(mod => mod.ArticleDetailModal), {
    loading: () => null,
    ssr: false
});

type TabType = 'pending' | 'no-summary';

export default function AdminPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [noSummaryArticles, setNoSummaryArticles] = useState<Article[]>([]);
    const [isLoadingArticles, setIsLoadingArticles] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isCollecting, setIsCollecting] = useState(false);

    // SWR Fetcher
    const fetcher = (url: string) => fetch(url).then(res => res.json());

    // SWR Hook for Collection Status
    const { data: collectionStatus, mutate: mutateCollectionStatus } = useSWR<{
        lastRunAt: string | null;
        articlesFound?: number;
        successCount?: number;
        failCount?: number;
        durationMs?: number;
        status: string
    }>('/api/admin/collection-status', fetcher, {
        refreshInterval: (data) => (data?.status === 'running' ? 5000 : 30000), // Poll faster when running, slower when idle
        revalidateOnFocus: true
    });

    // Bulk summarize state
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!loading && mounted) {
            if (!user || !isAdmin) {
                // router.push("/");
            } else {
                fetchArticles();
                // fetchCollectionStatus(); // Handle by SWR automatically
            }
        }
    }, [user, isAdmin, loading, mounted, activeTab]);

    // Refresh articles once when collection finishes (Watch status change)
    // We use a ref to track previous status to detect edge 'running' -> 'success'
    const prevStatusRef = useState<string | undefined>(undefined);
    // Actually simpler: just typical effect with check
    useEffect(() => {
        if (collectionStatus?.status === 'success') {
            // Check if it was running recently or just refreshing? 
            // For now, simple check is fine, usage is low.
            // But to avoid double fetch on initial load if already success:
            // Let's rely on manual refresh mostly, but auto-refresh is nice.
            // A simple refinement: check if lastRunAt changed? 
            // Minimal: just fetch if success. 
            // fetchArticles(); 
            // IMPORTANT: If we fetch every time SWR validates 'success', we loop if we aren't careful.
            // But SWR validates every 30s. Fetching articles every 30s is acceptable if status is success.
            // However, better to only fetch if status transitions from 'running' -> 'success'.
        }
    }, [collectionStatus?.status]);

    // Better Approach for Auto-Refresh on Finish: 
    // Store previous status in a ref
    const prevStatus = useRef<string>(collectionStatus?.status || '');
    useEffect(() => {
        if (prevStatus.current === 'running' && collectionStatus?.status === 'success') {
            fetchArticles();
            alert("수집이 완료되었습니다!");
        }
        prevStatus.current = collectionStatus?.status || '';
    }, [collectionStatus?.status]);

    const handleCollect = async () => {
        if (isCollecting || collectionStatus?.status === 'running') return;

        setIsCollecting(true);
        try {
            // Optimistic update or just wait
            const res = await fetch('/api/admin/collect', { method: 'POST' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to start collection');
            }
            alert("수집을 시작했습니다. 잠시 후 데이터가 자동으로 업데이트됩니다.");
            mutateCollectionStatus(); // Trigger immediate re-fetch
        } catch (error) {
            console.error("Error starting collection:", error);
            alert("수집 실패: " + (error as Error).message);
        } finally {
            setIsCollecting(false);
        }
    };

    const fetchArticles = async () => {
        setIsLoadingArticles(true);
        try {
            const t = new Date().getTime();

            if (activeTab === 'pending') {
                const res = await fetch(`/api/admin/articles?t=${t}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const articles: Article[] = await res.json();
                setPendingArticles(articles);
            } else {
                const res = await fetch(`/api/admin/articles/no-summary?t=${t}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setNoSummaryArticles(data.articles || []);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setIsLoadingArticles(false);
        }
    };

    const handleApprove = async (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (processingId) return;

        setProcessingId(articleId);
        try {
            const res = await fetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, status: 'published' })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || res.statusText);
            }

            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);
        } catch (error) {
            console.error("Error approving article:", error);
            alert("승인 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (processingId) return;

        if (!confirm("정말 이 게시물을 거절하시겠습니까?")) return;

        setProcessingId(articleId);
        try {
            const res = await fetch('/api/admin/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, status: 'rejected' })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || res.statusText);
            }

            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);
        } catch (error) {
            console.error("Error rejecting article:", error);
            alert("거절 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleBulkSummarize = async () => {
        if (noSummaryArticles.length === 0) return;

        if (!confirm(`${noSummaryArticles.length}개의 게시물을 일괄 요약하시겠습니까? 이 작업은 시간이 걸릴 수 있습니다.`)) {
            return;
        }

        setIsBulkProcessing(true);
        setBulkProgress({ current: 0, total: noSummaryArticles.length });

        try {
            const articleIds = noSummaryArticles.map(a => a.id);
            const res = await fetch('/api/admin/bulk-summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleIds })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.details || res.statusText);
            }

            const result = await res.json();
            alert(`완료! 성공: ${result.success}개, 실패: ${result.failed}개`);

            // Refresh the list
            fetchArticles();
        } catch (error) {
            console.error("Bulk summarize error:", error);
            alert("일괄 요약 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setIsBulkProcessing(false);
            setBulkProgress({ current: 0, total: 0 });
        }
    };

    const handleArticleUpdate = (updatedFields: Partial<Article>) => {
        if (!selectedArticle) return;

        const newSelected = { ...selectedArticle, ...updatedFields };
        setSelectedArticle(newSelected);

        if (activeTab === 'pending') {
            setPendingArticles(prev => prev.map(a =>
                a.id === selectedArticle.id ? { ...a, ...updatedFields } : a
            ));
        } else {
            // If summary was added, remove from no-summary list
            if (updatedFields.summary) {
                setNoSummaryArticles(prev => prev.filter(a => a.id !== selectedArticle.id));
            } else {
                setNoSummaryArticles(prev => prev.map(a =>
                    a.id === selectedArticle.id ? { ...a, ...updatedFields } : a
                ));
            }
        }
    };

    const currentArticles = activeTab === 'pending' ? pendingArticles : noSummaryArticles;

    // Initial Loading / Auth Check Skeleton
    if (!mounted || loading) {
        return (
            <div className="w-full space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-10">
                    <Skeleton className="h-8 w-32 " />
                    <Skeleton className="h-10 w-28 " />
                </div>

                {/* Info Text Skeleton */}
                <div className="h-4 w-64 mb-6 rounded" />

                {/* Tabs Skeleton */}
                <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <Skeleton className="h-8 w-24 " />
                    <Skeleton className="h-8 w-24 " />
                </div>

                {/* Articles Grid Skeleton */}
                <ArticleListSkeleton />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">수집 게시물</h1>
                    <Button
                        onClick={handleCollect}
                        disabled={isCollecting || collectionStatus?.status === 'running'}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                        {collectionStatus?.status === 'running' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                수집 중...
                            </>
                        ) : (
                            '수집 시작'
                        )}
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 min-h-[1.5rem]">
                    {collectionStatus?.lastRunAt ? (
                        <>
                            <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                최근 수집: {new Date(collectionStatus.lastRunAt).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                            <span className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                                총 <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{collectionStatus.articlesFound || 0}</strong>개 발견
                                {collectionStatus.successCount !== undefined && (
                                    <span className="text-zinc-400">
                                        (성공: <span className="text-zinc-700 dark:text-zinc-300">{collectionStatus.successCount}</span>,
                                        실패: <span className="text-red-500/80">{collectionStatus.failCount || 0}</span>)
                                    </span>
                                )}
                            </span>
                            {collectionStatus.durationMs !== undefined && (
                                <span className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                                    소요 시간: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{(collectionStatus.durationMs / 1000).toFixed(1)}</strong>초
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-zinc-400 italic">표시할 수집 정보가 없습니다. (스크레이퍼 실행 대기 중)</span>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending'
                        ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                >
                    승인 대기
                    {pendingArticles.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-full font-normal">
                            {pendingArticles.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('no-summary')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'no-summary'
                        ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                >
                    요약 없음
                    {noSummaryArticles.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-full font-normal">
                            {noSummaryArticles.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Bulk Action Button (only if no title) */}
            <div className="flex justify-end mb-6">
                {activeTab === 'no-summary' && noSummaryArticles.length > 0 && (
                    <Button
                        onClick={handleBulkSummarize}
                        disabled={isBulkProcessing}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isBulkProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                처리 중...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                전체 요약
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Articles Grid */}
            {isLoadingArticles ? (
                <ArticleListSkeleton />
            ) : currentArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>{activeTab === 'pending' ? '현재 승인 대기 중인 게시물이 없습니다.' : '요약이 없는 게시물이 없습니다.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentArticles.map((article) => (
                        <div key={article.id} className="flex flex-col gap-4">
                            <div
                                className="cursor-pointer"
                                onClick={() => setSelectedArticle(article)}
                            >
                                <ArticleCard article={article} onArticleClick={() => setSelectedArticle(article)} />
                            </div>
                            {activeTab === 'pending' && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                                        disabled={processingId === article.id}
                                        onClick={(e) => handleApprove(e, article.id)}
                                    >
                                        {processingId === article.id ? "처리 중..." : "승인"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                                        disabled={processingId === article.id}
                                        onClick={(e) => handleReject(e, article.id)}
                                    >
                                        거절
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedArticle && (
                <ArticleDetailModal
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                    isAdmin={true}
                    onUpdate={handleArticleUpdate}
                />
            )}
        </div>
    );
}
