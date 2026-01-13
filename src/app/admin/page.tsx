"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
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
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!user || !isAdmin) {
                router.push("/");
            } else {
                fetchPendingArticles();
            }
        }
    }, [user, isAdmin, loading, router]);

    const fetchPendingArticles = async () => {
        setIsLoadingArticles(true);
        try {
            const q = query(
                collection(db, "articles"),
                where("status", "==", "pending"),
                orderBy("pubDate", "desc")
            );
            const querySnapshot = await getDocs(q);
            const articles: Article[] = [];
            querySnapshot.forEach((doc) => {
                articles.push({ id: doc.id, ...doc.data() } as Article);
            });
            setPendingArticles(articles);
        } catch (error) {
            console.error("Error fetching pending articles:", error);
        } finally {
            setIsLoadingArticles(false);
        }
    };

    const handleApprove = async (articleId: string) => {
        try {
            const articleRef = doc(db, "articles", articleId);
            await updateDoc(articleRef, { status: "published" });
            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);
        } catch (error) {
            console.error("Error approving article:", error);
        }
    };

    const handleReject = async (articleId: string) => {
        if (!confirm("정말 이 게시물을 거절(삭제/숨김) 하시겠습니까?")) return;
        try {
            const articleRef = doc(db, "articles", articleId);
            await updateDoc(articleRef, { status: "rejected" });
            setPendingArticles((prev) => prev.filter((a) => a.id !== articleId));
            if (selectedArticle?.id === articleId) setSelectedArticle(null);
        } catch (error) {
            console.error("Error rejecting article:", error);
        }
    };

    if (loading || isLoadingArticles) {
        return <div className="p-8 text-center">Loading admin dashboard...</div>;
    }

    if (!isAdmin) {
        return null; // or redirecting
    }

    return (
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8">승인 대기 게시물</h1>

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
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(article.id)}
                                >
                                    Approve
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={() => handleReject(article.id)}
                                >
                                    Reject
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
