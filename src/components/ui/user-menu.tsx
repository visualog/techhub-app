'use client';

import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/button';

interface User {
    displayName: string | null;
    photoURL: string | null;
    email: string | null;
}

interface UserMenuProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

export function UserMenu({ user, onLogin, onLogout }: UserMenuProps) {
    if (!user) {
        return (
            <Button onClick={onLogin} size="sm" variant="outline">
                Google 로그인
            </Button>
        );
    }

    return (
        <DropdownMenu
            trigger={
                <button className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {user.photoURL ? (
                        <Image
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Avatar />
                    )}
                </button>
            }
        >
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                {user.displayName}
            </div>
            <DropdownMenuItem href="/bookmarks">
                북마크
            </DropdownMenuItem>
            <div
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={onLogout}
            >
                로그아웃
            </div>
        </DropdownMenu>
    );
}
