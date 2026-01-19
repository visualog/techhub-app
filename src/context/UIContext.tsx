'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '@/components/ui/Toast';

type JobType = 'thumbnail' | 'translate' | 'summarize' | 'extract' | 'revert';

interface processingJob {
    articleId: string;
    type: JobType;
}

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface UIContextType {
    toasts: ToastMessage[];
    processingJobs: processingJob[];
    addToast: (message: string, type?: ToastType) => void;
    startJob: (articleId: string, type: JobType) => void;
    endJob: (articleId: string, type: JobType) => void;
    isProcessing: (articleId: string, type?: JobType) => boolean;
    generateThumbnail: (articleId: string) => Promise<{ image: string } | null>;
    translateArticle: (articleId: string) => Promise<{ translatedTitle: string } | null>;
    revertTitle: (articleId: string) => Promise<{ title: string } | null>;
    summarizeArticle: (articleId: string, translateTitle?: boolean | 'auto') => Promise<{ summary: string; title?: string } | null>;
    updateThumbnail: (articleId: string, imageUrl: string) => Promise<{ image: string } | null>;
    extractThumbnail: (articleId: string) => Promise<{ image: string } | null>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [processingJobs, setProcessingJobs] = useState<processingJob[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const startJob = useCallback((articleId: string, type: JobType) => {
        setProcessingJobs((prev) => [...prev, { articleId, type }]);
    }, []);

    const endJob = useCallback((articleId: string, type: JobType) => {
        setProcessingJobs((prev) => prev.filter((job) => !(job.articleId === articleId && job.type === type)));
    }, []);

    const isProcessing = useCallback((articleId: string, type?: JobType) => {
        return processingJobs.some((job) =>
            job.articleId === articleId && (!type || job.type === type)
        );
    }, [processingJobs]);

    // API ACTION: Generate Thumbnail
    const generateThumbnail = async (articleId: string) => {
        if (isProcessing(articleId, 'thumbnail')) return null;

        startJob(articleId, 'thumbnail');
        addToast('썸네일 생성을 시작했습니다. (백그라운드에서 진행됨)', 'info');

        try {
            const res = await fetch('/api/admin/generate-thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                addToast('썸네일 생성이 완료되었습니다!', 'success');
                return { image: data.image }; // Assuming API returns image URL
            } else {
                addToast(`썸네일 생성 실패: ${data.error}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('썸네일 생성 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'thumbnail');
        }
    };

    // API ACTION: Translate Article
    const translateArticle = async (articleId: string) => {
        if (isProcessing(articleId, 'translate')) return null;

        startJob(articleId, 'translate');
        addToast('한글 번역 작업을 시작했습니다.', 'info');

        try {
            const res = await fetch('/api/admin/translate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                addToast('한글 번역이 완료되었습니다!', 'success');
                // window.location.reload();
                return { translatedTitle: data.translatedTitle };
            } else {
                addToast(`번역 실패: ${data.error}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('번역 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'translate');
        }
    };

    // API ACTION: Revert Title
    const revertTitle = async (articleId: string) => {
        if (isProcessing(articleId, 'revert')) return null;

        startJob(articleId, 'revert');
        addToast('제목을 원문으로 복원 중...', 'info');

        try {
            const res = await fetch('/api/admin/revert-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                addToast('제목이 원문으로 복원되었습니다!', 'success');
                return { title: data.title };
            } else {
                addToast(`복원 실패: ${data.error}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('복원 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'revert');
        }
    };

    // API ACTION: Summarize Article
    const summarizeArticle = async (articleId: string, translateTitle: boolean | 'auto' = 'auto') => {
        if (isProcessing(articleId, 'summarize')) return null;

        startJob(articleId, 'summarize');
        // Toast message varies based on action
        let msg = 'AI 요약 생성을 시작했습니다.';
        if (translateTitle === true) msg = 'AI 요약 및 제목 번역을 시작했습니다.';
        if (translateTitle === false) msg = 'AI 요약(제목 유지)을 시작했습니다.';
        addToast(msg, 'info');

        try {
            const res = await fetch('/api/admin/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, translateTitle })
            });
            const data = await res.json();

            if (res.ok && data.summary) {
                if (data.translatedTitle) {
                    addToast('AI 요약 및 제목 번역이 완료되었습니다!', 'success');
                } else {
                    addToast('AI 요약 생성이 완료되었습니다!', 'success');
                }
                // window.location.reload(); 
                return { summary: data.summary, title: data.translatedTitle };
            } else {
                addToast(`요약 실패: ${data.error || 'Unknown error'}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('요약 생성 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'summarize');
        }
    };

    // API ACTION: Update Thumbnail with URL
    const updateThumbnail = async (articleId: string, imageUrl: string) => {
        if (isProcessing(articleId, 'thumbnail')) return null;

        startJob(articleId, 'thumbnail');
        addToast('썸네일 업데이트 중...', 'info');

        try {
            const res = await fetch('/api/admin/update-thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, action: 'url', imageUrl })
            });
            const data = await res.json();

            if (data.success) {
                addToast('썸네일이 업데이트되었습니다!', 'success');
                // window.location.reload();
                return { image: data.image };
            } else {
                addToast(`썸네일 업데이트 실패: ${data.error}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('썸네일 업데이트 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'thumbnail');
        }
    };

    // API ACTION: Extract Thumbnail from Original
    const extractThumbnail = async (articleId: string) => {
        if (isProcessing(articleId, 'extract')) return null;

        startJob(articleId, 'extract');
        addToast('원본에서 이미지 추출 중...', 'info');

        try {
            const res = await fetch('/api/admin/update-thumbnail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, action: 'extract' })
            });
            const data = await res.json();

            if (data.success) {
                addToast('원본에서 이미지를 추출했습니다!', 'success');
                // window.location.reload();
                return { image: data.image };
            } else {
                addToast(`이미지 추출 실패: ${data.error}`, 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            addToast('이미지 추출 중 오류가 발생했습니다.', 'error');
            return null;
        } finally {
            endJob(articleId, 'extract');
        }
    };

    return (
        <UIContext.Provider value={{
            toasts, processingJobs, addToast, startJob, endJob, isProcessing,
            generateThumbnail, translateArticle, revertTitle, summarizeArticle, updateThumbnail, extractThumbnail
        }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300">
                        <Toast message={toast.message} type={toast.type} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
                    </div>
                ))}
            </div>
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
