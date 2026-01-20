'use client';

import { Article } from '@/data/mock-articles';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Calendar, BookOpen, Wand2, Loader2, ImagePlus, Link2, Search, ChevronDown, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useUI } from '@/context/UIContext';

interface ArticleDetailModalProps {
  article: Article;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdate?: (article: Partial<Article>) => void;
}

function cleanSummary(text?: string): string {
  if (!text) return '';
  return text
    .replace(/^(요약|Summary|결과|Here is the summary)[:\-]*/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\[System\].*?(\n|$)/g, '')
    .trim();
}

export function ArticleDetailModal({ article, onClose, isAdmin, onUpdate }: ArticleDetailModalProps) {
  const summary = cleanSummary(article.summary);
  const { generateThumbnail, isProcessing, translateArticle, revertTitle, summarizeArticle, updateThumbnail, extractThumbnail } = useUI();

  const [showThumbnailMenu, setShowThumbnailMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const translateMenuRef = useRef<HTMLDivElement>(null);

  const isGeneratingThumbnail = isProcessing(article.id, 'thumbnail');
  const isTranslating = isProcessing(article.id, 'translate');
  const isExtracting = isProcessing(article.id, 'extract');

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowThumbnailMenu(false);
        setShowUrlInput(false);
      }
      if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
        setShowTranslateMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Robust Date Parsing
  let pubDate: Date | null = null;
  // @ts-ignore
  if (article.pubDate && typeof article.pubDate.toDate === 'function') {
    // @ts-ignore
    pubDate = article.pubDate.toDate();
  } else {
    pubDate = new Date(article.pubDate);
  }
  const dateStr = (pubDate && !isNaN(pubDate.getTime()))
    ? pubDate.toLocaleDateString('ko-KR')
    : String(article.pubDate || '');

  const handleUrlSubmit = async () => {
    if (imageUrl.trim()) {
      const result = await updateThumbnail(article.id, imageUrl.trim());
      if (result && onUpdate) onUpdate({ image: result.image });
      setShowUrlInput(false);
      setImageUrl('');
    }
  };

  const handleTranslate = async () => {
    const result = await translateArticle(article.id);
    if (result && onUpdate && result.translatedTitle) {
      const updates: Partial<Article> = { title: result.translatedTitle };
      if (!article.originalTitle) {
        updates.originalTitle = article.title;
      }
      onUpdate(updates);
    }
    setShowTranslateMenu(false);
  };

  const handleRevertTitle = async () => {
    const result = await revertTitle(article.id);
    if (result && onUpdate && result.title) onUpdate({ title: result.title });
    setShowTranslateMenu(false);
  };

  const handleSummarize = async (translateTitle: boolean | 'auto') => {
    const result = await summarizeArticle(article.id, translateTitle);
    if (result && onUpdate) {
      const updates: Partial<Article> = { summary: result.summary };
      if (result.title) {
        updates.title = result.title;
        if (!article.originalTitle) {
          updates.originalTitle = article.title;
        }
      }
      onUpdate(updates);
    }
    setShowTranslateMenu(false);
  };

  const handleExtract = async () => {
    const result = await extractThumbnail(article.id);
    if (result && onUpdate) onUpdate({ image: result.image });
    setShowThumbnailMenu(false);
  };

  const handleGenerateThumbnail = async () => {
    const result = await generateThumbnail(article.id);
    if (result && onUpdate) onUpdate({ image: result.image });
    setShowThumbnailMenu(false);
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

            {(isGeneratingThumbnail || isExtracting) && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-400" />
                <span className="font-semibold text-lg">{isExtracting ? '이미지 추출 중...' : 'AI 썸네일 생성 중...'}</span>
                <span className="text-sm opacity-80 mt-1">창을 닫아도 작업은 계속됩니다.</span>
              </div>
            )}

            <div className="absolute bottom-4 left-6 right-6">
              <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-white bg-blue-500/80 backdrop-blur-md rounded-md">
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
              {(isGeneratingThumbnail || isExtracting) && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-blue-600 z-20 py-10">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="font-semibold">{isExtracting ? '이미지 추출 중...' : '썸네일 생성 중...'}</span>
                </div>
              )}
              <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-md">
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
              <div className="flex items-center gap-2 flex-wrap">
                {/* Translate & Summarize Dropdown */}
                <div className="relative" ref={translateMenuRef}>
                  <Button
                    variant="outline"
                    disabled={isProcessing(article.id, 'summarize') || isTranslating}
                    onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                    className="gap-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {(isProcessing(article.id, 'summarize') || isTranslating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                    AI 번역/요약
                    <ChevronDown className="w-3 h-3" />
                  </Button>

                  {showTranslateMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 min-w-[200px] z-30">
                      <button
                        onClick={handleTranslate}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                      >
                        <span className="font-medium">제목만 번역</span>
                        <span className="text-xs text-zinc-400 ml-auto">A→가</span>
                      </button>

                      <button
                        onClick={() => handleSummarize(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                      >
                        <span className="font-medium">내용(요약)만 번역</span>
                        <span className="text-xs text-zinc-400 ml-auto">제목 유지</span>
                      </button>

                      <button
                        onClick={() => handleSummarize(true)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                      >
                        <span className="font-medium">둘 다 번역</span>
                        <span className="text-xs text-zinc-400 ml-auto">전체</span>
                      </button>

                      {(article.originalTitle && article.title !== article.originalTitle) && (
                        <>
                          <div className="h-px bg-zinc-100 dark:bg-zinc-700 my-1" />
                          <button
                            onClick={handleRevertTitle}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-left"
                          >
                            <span className="font-medium">원문으로 복원</span>
                            <span className="text-xs ml-auto">Reset</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail Dropdown */}
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="outline"
                    disabled={isGeneratingThumbnail || isExtracting}
                    onClick={() => setShowThumbnailMenu(!showThumbnailMenu)}
                    className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  >
                    {(isGeneratingThumbnail || isExtracting) ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    썸네일
                    <ChevronDown className="w-3 h-3" />
                  </Button>

                  {showThumbnailMenu && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 min-w-[180px] z-30">
                      {showUrlInput ? (
                        <div className="p-3">
                          <input
                            type="url"
                            placeholder="이미지 URL 입력"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" onClick={handleUrlSubmit} className="flex-1 text-xs">
                              적용
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowUrlInput(false)} className="text-xs">
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowUrlInput(true)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <Link2 className="w-4 h-4" />
                            URL 직접 입력
                          </button>
                          <button
                            onClick={handleExtract}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <Search className="w-4 h-4" />
                            원본에서 추출
                          </button>
                          <button
                            onClick={handleGenerateThumbnail}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <Wand2 className="w-4 h-4" />
                            AI 이미지 생성
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
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
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
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

