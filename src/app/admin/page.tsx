"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/data/mock-articles";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { Button } from "@/components/ui/button";
import { ArticleDetailModal } from "@/components/ui/ArticleDetailModal";

export default function AdminPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [isLoadingArticles, setIsLoadingArticles] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log("AdminPage: Mounted. User:", user?.email, "IsAdmin:", isAdmin);
    }, [user, isAdmin]);

    useEffect(() => {
        if (!loading) {
            if (!user || !isAdmin) {
                console.log("AdminPage: Redirecting...", { user, isAdmin, loading });
                // router.push("/"); // Temporarily disable redirect to see logs if needed
            } else {
                fetchPendingArticles();
            }
        }
    }, [user, isAdmin, loading, router]);

    const fetchPendingArticles = async () => {
        setIsLoadingArticles(true);
        try {
            console.log("AdminPage: Fetching pending articles from API...");
            const t = new Date().getTime();
            const res = await fetch(`/api/admin/articles?t=${t}`);
            console.log("AdminPage: Fetch status:", res.status);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const articles: Article[] = await res.json();
            console.log("AdminPage: Loaded articles", articles.length);

            if (articles.length === 0) {
                console.warn("AdminPage: API returned 0 articles!");
            } else {
                console.log("AdminPage: First article:", articles[0]);
            }

            setPendingArticles(articles);
        } catch (error) {
            console.error("Error fetching pending articles:", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setIsLoadingArticles(false);
        }
    };

    const handleApprove = async (e: React.MouseEvent, articleId: string) => {
        e.stopPropagation();
        if (processingId) return;

        console.log("Approve clicked for:", articleId);
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

            console.log("Status updated to published");

            // Remove from list
            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);

            // Optional: Success toast or alert if needed, but removing from list is usually enough feedback
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

        if (!confirm("정말 이 게시물을 거절(삭제/숨김) 하시겠습니까?")) return;

        console.log("Reject clicked for:", articleId);
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

            console.log("Status updated to rejected");

            // Remove from list
            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);
        } catch (error) {
            console.error("Error rejecting article:", error);
            alert("거절 중 오류가 발생했습니다: " + (error as Error).message);
        } finally {
            setProcessingId(null);
        }
    };

    if (!mounted || loading || isLoadingArticles) {
        return <div className="p-8 text-center">Loading admin dashboard...</div>;
    }

    // ...

    return (
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
                승인 대기 게시물
                {pendingArticles.length > 0 && (
                    <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                        {pendingArticles.length}
                    </span>
                )}
            </h1>

            {pendingArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>현재 승인 대기 중인 게시물이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingArticles.map((article) => (
                        <div key={article.id} className="flex flex-col gap-4">
                            <div
                                className="cursor-pointer"
                                onClick={() => setSelectedArticle(article)}
                            >
                                <ArticleCard article={article} onArticleClick={() => setSelectedArticle(article)} />
                            </div>
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
                        </div>
                    ))}
                </div>
            )}

            {selectedArticle && (
                <ArticleDetailModal
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                    isAdmin={true}
                />
            )}
        </div>
    );
}
