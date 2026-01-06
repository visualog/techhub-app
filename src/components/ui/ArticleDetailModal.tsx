'use client';

import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
}

function cleanSummary(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^(요약|Summary|결과|Here is the summary)[:\-]*/i, '') // Remove prefixes
    .replace(/^["']|["']$/g, '') // Remove wrapping quotes
    .replace(/\[System\].*?(\n|$)/g, '') // Remove system prompt leaks if any
    .trim();
}

export function ArticleDetailModal({ article, onClose }: ArticleDetailModalProps) {
  const summary = cleanSummary(article.summary);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative animate-in zoom-in-95 duration-200 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {article.image && (
          <div className="relative w-full aspect-video">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-white bg-indigo-500/80 backdrop-blur-md rounded-md">
                {article.category || 'Tech'}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white shadow-sm leading-tight">
                {article.title}
              </h2>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          {!article.image && (
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white leading-tight">
              {article.title}
            </h2>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-zinc-600 dark:text-zinc-300">
                {article.source.substring(0, 2)}
              </div>
              <span className="font-medium">{article.source}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.pubDate).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI 요약</h3>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl leading-relaxed text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
              {summary || "요약 내용이 없습니다."}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 -mx-6 -mb-6 md:-mx-8 md:-mb-8 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              닫기
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
              asChild
            >
              <Link href={article.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                기사 원문 보기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
