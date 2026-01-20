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
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
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
            </div>
        </aside>
    );
}
