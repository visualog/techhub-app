'use client';

import { NavItem } from "@/components/ui/nav-item";
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            name: '승인 대기 게시물',
            href: '/admin',
        },
        {
            name: '사이트 설정',
            href: '/admin/settings',
        },
    ];

    return (
        <aside className="w-full md:w-64 p-8 border-b md:border-b-0 border-neutral-200 dark:border-neutral-800 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
            <h2 className="hidden">Admin Menu</h2>
            <nav>
                <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-y-0 md:space-y-0">
                    {menuItems.map((item) => (
                        <li key={item.href} className="flex-shrink-0">
                            <NavItem
                                href={item.href}
                                label={item.name}
                                isActive={pathname === item.href}
                            />
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
