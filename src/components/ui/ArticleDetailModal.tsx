'use client';

import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
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

          <h3 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-neutral-200">요약</h3>
          <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
            {article.summary}
          </p>

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
