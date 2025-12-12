'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: article.link }),
        });

        if (!response.ok) {
          throw new Error('요약을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setSummary(data.summary);
      } catch (e: any) {
        setError(e.message || '요약을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [article.link]);

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {article.image && (
          <div className="relative w-full h-72">
            <Image
              src={article.image}
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-white">{article.title}</h2>
          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            <span>{article.source}</span>
            <span className="mx-2">·</span>
            <span>{new Date(article.pubDate).toLocaleDateString('ko-KR')}</span>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700 my-4"></div>

          <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">AI 요약</h3>
          {isLoading && (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!isLoading && !error && (
            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
              {summary}
            </p>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-700 my-4"></div>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              닫기
            </button>
            <Link 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              원본 기사 읽기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
