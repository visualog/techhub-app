'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastType } from '@/components/ui/Toast';

type JobType = 'thumbnail' | 'translate';

interface processingJob {
    articleId: string;
    type: JobType;
}

interface UIContextType {
    toasts: ToastMessage[];
    processingJobs: processingJob[];
    addToast: (message: string, type?: ToastType) => void;
    startJob: (articleId: string, type: JobType) => void;
    endJob: (articleId: string, type: JobType) => void;
    isProcessing: (articleId: string, type?: JobType) => boolean;
    generateThumbnail: (articleId: string) => Promise<void>;
    translateArticle: (articleId: string) => Promise<void>;
}

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
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
        }, 3000); // 3 seconds (as requested 1-2s, slightly longer for readability)
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
        if (isProcessing(articleId, 'thumbnail')) return;

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
            } else {
                addToast(`썸네일 생성 실패: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('썸네일 생성 중 오류가 발생했습니다.', 'error');
        } finally {
            endJob(articleId, 'thumbnail');
        }
    };

    // API ACTION: Translate Article
    const translateArticle = async (articleId: string) => {
        if (isProcessing(articleId, 'translate')) return;

        startJob(articleId, 'translate');
        addToast('한글 번역 작업을 시작했습니다.', 'info');

        try {
            // Need to implement this API endpoint next
            const res = await fetch('/api/admin/translate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId })
            });
            const data = await res.json();

            if (data.success) {
                addToast('한글 번역이 완료되었습니다!', 'success');
            } else {
                addToast(`번역 실패: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error(error);
            addToast('번역 중 오류가 발생했습니다.', 'error');
        } finally {
            endJob(articleId, 'translate');
        }
    };

    return (
        <UIContext.Provider value={{
            toasts, processingJobs, addToast, startJob, endJob, isProcessing,
            generateThumbnail, translateArticle
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
