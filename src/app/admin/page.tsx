"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Article } from "@/data/mock-articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
import { ArticleDetailModal } from "@/components/ui/ArticleDetailModal";
import { Loader2, Sparkles } from "lucide-react";

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
            }
        }
    }, [user, isAdmin, loading, mounted, activeTab]);

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

    if (!mounted || loading || isLoadingArticles) {
        return <div className="p-8 text-center">Loading admin dashboard...</div>;
    }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-6">수집 게시물</h1>

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
            {currentArticles.length === 0 ? (
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
