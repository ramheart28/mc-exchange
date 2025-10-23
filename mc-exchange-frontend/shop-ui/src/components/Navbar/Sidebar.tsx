// Login -> Owner Home Page (Not Logged In)
// Profile Icon -> Profile Page/Settings/Logout (Logged In)
// Regions Menu -> Regions Page
// Logo -> Home Page
// Contact page link -> Contact Page


"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { HomeIcon, UserIcon, MapIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import LogoutButton from "@/components/LogoutButton";

const navLinks = [
    {href: '/', label: 'Item Market', icon: <HomeIcon className='w-6 h-6' />},
    {href: '/regions/', label: 'Regions', icon: <MapIcon className='w-6 h-6' />},
    {href: '/contact/', label: 'Contact', icon: <EnvelopeIcon className='w-6 h-6' />},
    {href: '/profile/', label: 'Profile', icon:  <UserIcon className='w-6 h-6' />},
];



export default function Sidebar() {
    const pathname = usePathname();
    return (

    <aside className="m-2 w-20 h-55 bg-pv-surface border-r border-b rounded-lg border-pv-accent-border p-4 mt-10 space-y-4 flex flex-col">
      <nav className="flex flex-col gap-2 flex-1">
        {navLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
          >
            <span
              className={`px-2 py-2 rounded hover:bg-pv-surface-elevated transition-colors cursor-pointer flex items-center gap-2 ${
                pathname === href
                  ? "bg-pv-primary text-white font-semibold "
                  : "text-pv-text-primary hover:text-white"
              }`}
              title={label}
            >
              {typeof icon === "string" ? (
                <Image src={icon} alt={label} width={24} height={24} />
              ) : (
                icon
              )}
            </span>
          </Link>
        ))}
      </nav>
      
      {/* Logout button at bottom */}
      <div className="mt-auto pt-4 border-t border-pv-border">
        <LogoutButton />
      </div>
    </aside>
    );

}