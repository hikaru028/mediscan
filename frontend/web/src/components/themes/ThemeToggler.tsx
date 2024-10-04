"use client"

import { FC, createElement } from "react"
import { PiSunDimLight, PiMoonStarsLight, PiDesktopLight } from "react-icons/pi";
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ThemeToggler: FC = () => {
    const { theme, setTheme } = useTheme()
    let themeIcon;

    if (theme === 'dark') {
        themeIcon = PiMoonStarsLight;
    } else if (theme === 'light') {
        themeIcon = PiSunDimLight;
    } else {
        themeIcon = PiDesktopLight;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" className='absolute top-3 right-10 rounded-full bg-transparent z-50 hover:bg-secondary'>
                    {createElement(themeIcon, { className: "h-6 w-6 text-primary stroke-[1.5px]" })}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ThemeToggler