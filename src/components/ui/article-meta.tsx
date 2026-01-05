import React from 'react';

interface ArticleMetaProps {
    source: string;
    date: string;
}

// 날짜 포매팅 헬퍼 함수 (Moved from ArticleCard)
function formatRelativeDate(dateString: string): string {
    const now = new Date();
    const pubDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - pubDate.getTime()) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = secondsInMinute * 60;
    const secondsInDay = secondsInHour * 24;
    const secondsInWeek = secondsInDay * 7;

    if (diffInSeconds < secondsInMinute) {
        return "방금 전";
    } else if (diffInSeconds < secondsInHour) {
        const minutes = Math.floor(diffInSeconds / secondsInMinute);
        return `${minutes}분 전`;
    } else if (diffInSeconds < secondsInDay) {
        const hours = Math.floor(diffInSeconds / secondsInHour);
        return `${hours}시간 전`;
    } else if (diffInSeconds < secondsInWeek) {
        const days = Math.floor(diffInSeconds / secondsInDay);
        return `${days}일 전`;
    } else {
        const year = pubDate.getFullYear();
        const month = String(pubDate.getMonth() + 1).padStart(2, '0');
        const day = String(pubDate.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }
}

/**
 * ArticleMeta Molecule
 * Displays article metadata: Source and Relative Date.
 */
export const ArticleMeta = ({ source, date }: ArticleMetaProps) => {
    const formattedDate = formatRelativeDate(date);

    return (
        <div className="flex justify-start items-center text-xs font-normal text-neutral-500 dark:text-neutral-400 mb-2">
            <span>{source}</span>
            <span className="mx-2 opacity-50">|</span>
            <span suppressHydrationWarning>{formattedDate}</span>
        </div>
    );
};
