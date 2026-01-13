'use client';

import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Calendar, BookOpen, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [displayImage, setDisplayImage] = useState(article.image);
  const [isGenerating, setIsGenerating] = useState(false);

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


  const handleGenerateThumbnail = async () => {
    if (!confirm("AI로 썸네일을 생성하시겠습니까? 시간이 걸릴 수 있습니다.")) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setDisplayImage(data.imageUrl);
      } else {
        alert(`실패: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

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

        {displayImage && (
          <div className="relative w-full aspect-video">
            <Image
              src={displayImage}
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
          {!displayImage && (
            <div className="mb-6">
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
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">AI 요약</h3>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl leading-relaxed text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
              {summary || "요약 내용이 없습니다."}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 -mx-6 -mb-6 md:-mx-8 md:-mb-8 border-t border-zinc-100 dark:border-zinc-800">
            {isAdmin && (
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <Button
                  variant={isGenerating ? "secondary" : "outline"}
                  disabled={isGenerating}
                  onClick={handleGenerateThumbnail}
                  className={`gap-2 transition-all duration-300 ${isGenerating
                      ? "w-full md:w-48 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800"
                      : "border-indigo-200 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    }`}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGenerating ? 'AI가 썸네일 생성 중...' : 'AI 썸네일 생성'}
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
