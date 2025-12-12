import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // In a real implementation, you would fetch the article content from the URL,
    // then use a language model to generate a summary.
    // For now, we'll just simulate a delay and return a placeholder summary.

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network and AI processing delay

    const placeholderSummary = `이것은 '${url}' 기사에 대한 AI 생성 요약의 예시입니다. 실제 구현에서는 이 텍스트가 기사의 주요 내용을 담은 요약으로 대체됩니다. 이 기능은 사용자가 전체 기사를 읽기 전에 핵심 내용을 빠르게 파악할 수 있도록 돕기 위해 설계되었습니다.`;

    return NextResponse.json({ summary: placeholderSummary });
  } catch (error) {
    console.error('Error in /api/summarize:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
