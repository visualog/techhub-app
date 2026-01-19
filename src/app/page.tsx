
import { HomeClient } from '@/components/HomeClient';
import { getArticles } from '@/lib/articles';
import { categories } from '@/data/categories';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
  }>;
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || 'all';

  const categoryName = categories.find(
    (cat) => cat.id === currentCategory
  )?.name || "전체 보기";

  const articles = await getArticles({
    category: currentCategory,
    tag: searchParams.tag,
    search: searchParams.search
  });

  return (
    <HomeClient
      articles={articles}
      categoryName={categoryName}
    />
  );
}
