'use client';

import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Calendar, BookOpen, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useUI } from '@/context/UIContext';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
  isAdmin?: boolean;
}

function cleanSummary(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^(요약|Summary|결과|Here is the summary)[:\-]*/i, '') // Remove prefixes
    .replace(/^["']|["']$/g, '') // Remove wrapping quotes
    .replace(/\[System\].*?(\n|$)/g, '') // Remove system prompt leaks if any
    .trim();
}

export function ArticleDetailModal({ article, onClose, isAdmin }: ArticleDetailModalProps) {
  const summary = cleanSummary(article.summary);
  const { generateThumbnail, isProcessing, translateArticle } = useUI();

  const isGeneratingThumbnail = isProcessing(article.id, 'thumbnail');
  const isTranslating = isProcessing(article.id, 'translate');

  // Robust Date Parsing
  let pubDate: Date | null = null;
  // @ts-ignore - Handle Firestore Timestamp duck typing
  if (article.pubDate && typeof article.pubDate.toDate === 'function') {
    // @ts-ignore
    pubDate = article.pubDate.toDate();
  } else {
    pubDate = new Date(article.pubDate);
  }
  const dateStr = (pubDate && !isNaN(pubDate.getTime()))
    ? pubDate.toLocaleDateString('ko-KR')
    : String(article.pubDate || '');


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

            {/* Generating Indicator Overlay */}
            {isGeneratingThumbnail && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-400" />
                <span className="font-semibold text-lg">AI 썸네일 생성 중...</span>
                <span className="text-sm opacity-80 mt-1">창을 닫아도 작업은 계속됩니다.</span>
              </div>
            )}

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
            <div className="mb-6 relative">
              {/* Generating Indicator Overlay for No-Image State */}
              {isGeneratingThumbnail && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-600 z-20 py-10">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-semibold">썸네일 생성 중...</span>
                </div>
              )}
              <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md">
                {article.category || 'Tech'}
              </span>
              <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white leading-tight">
                {article.title}
              </h2>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase text-zinc-600 dark:text-zinc-300">
                {(article.source || '??').substring(0, 2)}
              </div>
              <span className="font-medium">{article.source}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl leading-relaxed text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
              {summary || "요약 내용이 없습니다."}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 -mx-6 -mb-6 md:-mx-8 md:-mb-8 border-t border-zinc-100 dark:border-zinc-800">
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={isTranslating}
                  onClick={() => translateArticle(article.id)}
                  className="gap-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : "A→가"}
                  {isTranslating ? '번역 중...' : '한글로 번역'}
                </Button>

                <Button
                  variant={isGeneratingThumbnail ? "secondary" : "outline"}
                  disabled={isGeneratingThumbnail}
                  onClick={() => generateThumbnail(article.id)}
                  className={`gap-2 transition-all duration-300 ${isGeneratingThumbnail
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800"
                      : "border-indigo-200 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    }`}
                >
                  {isGeneratingThumbnail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGeneratingThumbnail ? '생성 중...' : 'AI 썸네일 생성'}
                </Button>
              </div>
            )}

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
